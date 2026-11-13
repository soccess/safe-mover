#!/usr/bin/env python3
"""
학습 게임 모음 - Turso DB HTTP 프록시 및 정적 웹 서버
표준 라이브러리만 사용합니다 (추가 pip 설치 불필요).
"""

from __future__ import annotations

import argparse
import http.server
import json
import mimetypes
import os
import socketserver
import sqlite3
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env.turso"
LOCAL_FALLBACK_DB = BASE_DIR / "local_fallback.db"

SCHEMA_SQL = [
    """
    CREATE TABLE IF NOT EXISTS learning_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game TEXT NOT NULL,
        student_name TEXT NOT NULL DEFAULT '기본 학생',
        stage TEXT NOT NULL DEFAULT '',
        score INTEGER NOT NULL DEFAULT 0,
        summary TEXT NOT NULL DEFAULT '',
        payload_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
    """.strip(),
    """
    CREATE TABLE IF NOT EXISTS kv_state (
        k TEXT PRIMARY KEY,
        v TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
    """.strip(),
]


def load_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        values[k] = v
    return values


def get_config() -> dict[str, Any]:
    file_env = load_env_file(ENV_FILE)

    def pick(key: str, default: str = "") -> str:
        return (os.environ.get(key) or file_env.get(key) or default).strip()

    raw_url = pick("TURSO_DATABASE_URL")
    token = pick("TURSO_AUTH_TOKEN")
    port_str = pick("PORT", "8787")
    try:
        port = int(port_str)
    except ValueError:
        port = 8787

    http_url = normalize_turso_url(raw_url)
    return {
        "raw_url": raw_url,
        "http_url": http_url,
        "token": token,
        "port": port,
        "has_turso": bool(http_url and token),
    }


def normalize_turso_url(url: str) -> str:
    if not url:
        return ""
    u = url.strip().rstrip("/")
    if u.startswith("libsql://"):
        u = "https://" + u[len("libsql://") :]
    elif u.startswith("turso://"):
        u = "https://" + u[len("turso://") :]
    return u


def encode_arg(val: Any) -> dict[str, Any]:
    if val is None:
        return {"type": "null"}
    if isinstance(val, bool):
        return {"type": "integer", "value": "1" if val else "0"}
    if isinstance(val, int):
        return {"type": "integer", "value": str(val)}
    if isinstance(val, float):
        return {"type": "float", "value": val}
    return {"type": "text", "value": str(val)}


def decode_cell(cell: dict[str, Any]) -> Any:
    ctype = cell.get("type")
    if ctype == "null":
        return None
    val = cell.get("value")
    if ctype == "integer" and val is not None:
        try:
            return int(val)
        except (TypeError, ValueError):
            return val
    if ctype == "float" and val is not None:
        try:
            return float(val)
        except (TypeError, ValueError):
            return val
    return val


class DatabaseClient:
    def __init__(self, cfg: dict[str, Any]):
        self.cfg = cfg

    @property
    def is_turso(self) -> bool:
        return bool(self.cfg["has_turso"])

    def execute_turso(self, statements: list[tuple[str, list[Any]]]) -> list[dict[str, Any]]:
        endpoint = f"{self.cfg['http_url']}/v2/pipeline"
        requests_payload: list[dict[str, Any]] = []
        for sql, params in statements:
            stmt: dict[str, Any] = {"sql": sql}
            if params:
                stmt["args"] = [encode_arg(p) for p in params]
            requests_payload.append({"type": "execute", "stmt": stmt})
        requests_payload.append({"type": "close"})

        body = json.dumps({"requests": requests_payload}).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.cfg['token']}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                raw = resp.read().decode("utf-8")
                data = json.loads(raw)
        except urllib.error.HTTPError as err:
            err_body = err.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Turso HTTP {err.code}: {err_body or err.reason}") from err
        except urllib.error.URLError as err:
            raise RuntimeError(f"Turso 연결 실패: {err.reason}") from err

        parsed_results: list[dict[str, Any]] = []
        for idx, res in enumerate(data.get("results", [])):
            if idx >= len(statements):
                break
            if res.get("type") == "error":
                err_obj = res.get("error", {})
                raise RuntimeError(f"Turso SQL 오류: {err_obj.get('message', res)}")
            result_obj = res.get("response", {}).get("result", {})
            cols = [c.get("name", f"col_{i}") for i, c in enumerate(result_obj.get("cols", []))]
            rows = []
            for row_cells in result_obj.get("rows", []):
                row_dict = {}
                for c_idx, cell in enumerate(row_cells):
                    col_name = cols[c_idx] if c_idx < len(cols) else f"col_{c_idx}"
                    row_dict[col_name] = decode_cell(cell)
                rows.append(row_dict)
            parsed_results.append(
                {
                    "cols": cols,
                    "rows": rows,
                    "affected_row_count": result_obj.get("affected_row_count", 0),
                    "last_insert_rowid": result_obj.get("last_insert_rowid"),
                }
            )
        return parsed_results

    def execute_local(self, statements: list[tuple[str, list[Any]]]) -> list[dict[str, Any]]:
        conn = sqlite3.connect(LOCAL_FALLBACK_DB)
        conn.row_factory = sqlite3.Row
        try:
            parsed: list[dict[str, Any]] = []
            cur = conn.cursor()
            for sql, params in statements:
                cur.execute(sql, params)
                if cur.description:
                    cols = [d[0] for d in cur.description]
                    rows = [dict(r) for r in cur.fetchall()]
                else:
                    cols = []
                    rows = []
                parsed.append(
                    {
                        "cols": cols,
                        "rows": rows,
                        "affected_row_count": cur.rowcount if cur.rowcount >= 0 else 0,
                        "last_insert_rowid": cur.lastrowid,
                    }
                )
            conn.commit()
            return parsed
        finally:
            conn.close()

    def execute(self, sql: str, params: list[Any] | None = None) -> dict[str, Any]:
        stmts = [(sql, params or [])]
        res = self.execute_turso(stmts) if self.is_turso else self.execute_local(stmts)
        return res[0] if res else {"cols": [], "rows": [], "affected_row_count": 0}

    def execute_many(self, statements: list[tuple[str, list[Any]]]) -> list[dict[str, Any]]:
        return self.execute_turso(statements) if self.is_turso else self.execute_local(statements)

    def init_schema(self) -> None:
        self.execute_many([(sql, []) for sql in SCHEMA_SQL])

    def health_check(self) -> dict[str, Any]:
        if self.is_turso:
            try:
                res = self.execute("SELECT 1 AS ok, datetime('now', 'localtime') AS server_time")
                row = res["rows"][0] if res["rows"] else {}
                return {
                    "ok": True,
                    "mode": "turso",
                    "db_url": self.cfg["http_url"],
                    "server_time": row.get("server_time"),
                }
            except Exception as exc:
                return {
                    "ok": False,
                    "mode": "turso",
                    "db_url": self.cfg["http_url"],
                    "error": str(exc),
                }
        try:
            self.execute("SELECT 1 AS ok")
            return {
                "ok": True,
                "mode": "local-fallback",
                "db_url": str(LOCAL_FALLBACK_DB.name),
                "message": ".env.turso 설정이 없어 로컬 SQLite(local_fallback.db)로 동작 중입니다.",
            }
        except Exception as exc:
            return {"ok": False, "mode": "local-fallback", "error": str(exc)}


class AppHandler(http.server.SimpleHTTPRequestHandler):
    db_client: DatabaseClient

    def __init__(self, *args: Any, **kwargs: Any):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:
        sys.stdout.write(f"[HTTP] {self.address_string()} - {format % args}\n")

    def send_json(self, status: int, data: Any) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def guess_type(self, path: str) -> str:
        ctype, _ = mimetypes.guess_type(path)
        if ctype in ("text/html", "text/css", "application/javascript", "text/javascript"):
            return f"{ctype}; charset=utf-8"
        if path.endswith(".js"):
            return "application/javascript; charset=utf-8"
        return ctype or "application/octet-stream"

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json(200, self.db_client.health_check())
            return

        if parsed.path == "/api/records":
            qs = urllib.parse.parse_qs(parsed.query)
            game = (qs.get("game") or [""])[0].strip()
            try:
                limit = max(1, min(100, int((qs.get("limit") or ["30"])[0])))
            except ValueError:
                limit = 30
            try:
                self.db_client.init_schema()
                if game:
                    res = self.db_client.execute(
                        "SELECT id, game, student_name, stage, score, summary, payload_json, created_at "
                        "FROM learning_records WHERE game = ? ORDER BY id DESC LIMIT ?",
                        [game, limit],
                    )
                else:
                    res = self.db_client.execute(
                        "SELECT id, game, student_name, stage, score, summary, payload_json, created_at "
                        "FROM learning_records ORDER BY id DESC LIMIT ?",
                        [limit],
                    )
                self.send_json(200, {"ok": True, "records": res["rows"]})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc)})
            return

        if parsed.path == "/api/kv":
            qs = urllib.parse.parse_qs(parsed.query)
            key = (qs.get("key") or [""])[0].strip()
            if not key:
                self.send_json(400, {"ok": False, "error": "key parameter is required"})
                return
            try:
                self.db_client.init_schema()
                res = self.db_client.execute("SELECT k, v, updated_at FROM kv_state WHERE k = ?", [key])
                row = res["rows"][0] if res["rows"] else None
                self.send_json(200, {"ok": True, "found": row is not None, "item": row})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc)})
            return

        # Prevent exposing .env.turso over HTTP
        if ".env" in parsed.path or parsed.path.endswith(".db"):
            self.send_error(403, "Forbidden")
            return

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/init":
            try:
                self.db_client.init_schema()
                self.send_json(200, {"ok": True, "health": self.db_client.health_check()})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc)})
            return

        if parsed.path == "/api/records":
            try:
                body = self.read_json_body()
                game = str(body.get("game") or "unknown")[:40]
                student_name = str(body.get("student_name") or "기본 학생")[:60]
                stage = str(body.get("stage") or "")[:120]
                score = int(body.get("score") or 0)
                summary = str(body.get("summary") or "")[:300]
                payload_obj = body.get("payload") if body.get("payload") is not None else {}
                payload_json = json.dumps(payload_obj, ensure_ascii=False)[:8000]

                self.db_client.init_schema()
                res = self.db_client.execute(
                    "INSERT INTO learning_records (game, student_name, stage, score, summary, payload_json) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    [game, student_name, stage, score, summary, payload_json],
                )
                self.send_json(
                    201,
                    {
                        "ok": True,
                        "id": res.get("last_insert_rowid"),
                        "mode": "turso" if self.db_client.is_turso else "local-fallback",
                    },
                )
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc)})
            return

        if parsed.path == "/api/kv":
            try:
                body = self.read_json_body()
                key = str(body.get("key") or "").strip()[:120]
                if not key:
                    self.send_json(400, {"ok": False, "error": "key is required"})
                    return
                value = body.get("value")
                val_str = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
                self.db_client.init_schema()
                self.db_client.execute(
                    "INSERT INTO kv_state (k, v, updated_at) VALUES (?, ?, datetime('now', 'localtime')) "
                    "ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = datetime('now', 'localtime')",
                    [key, val_str],
                )
                self.send_json(200, {"ok": True})
            except Exception as exc:
                self.send_json(500, {"ok": False, "error": str(exc)})
            return

        self.send_json(404, {"ok": False, "error": "Not found"})


class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> int:
    parser = argparse.ArgumentParser(description="학습 게임 모음 Turso DB 서버")
    parser.add_argument("--check", action="store_true", help="DB 연결 상태만 확인하고 종료")
    parser.add_argument("--init", action="store_true", help="DB 테이블 초기화 후 종료")
    parser.add_argument("--port", type=int, default=0, help="서버 포트 지정")
    args = parser.parse_args()

    cfg = get_config()
    if args.port:
        cfg["port"] = args.port
    client = DatabaseClient(cfg)

    if args.check or args.init:
        health = client.health_check()
        print(json.dumps(health, ensure_ascii=False, indent=2))
        if not health.get("ok"):
            return 1
        if args.init:
            client.init_schema()
            print("[OK] learning_records, kv_state 테이블 준비 완료")
        return 0

    try:
        client.init_schema()
    except Exception as exc:
        print(f"[WARN] 초기 테이블 생성 중 오류 발생: {exc}")

    AppHandler.db_client = client
    port = cfg["port"]
    health = client.health_check()
    mode_label = f"Turso DB ({cfg['http_url']})" if client.is_turso else f"로컬 SQLite 임시 모드 ({LOCAL_FALLBACK_DB.name})"
    print("=" * 60)
    print(f"  학습 게임 모음 서버 시작: http://127.0.0.1:{port}")
    print(f"  데이터베이스 모드      : {mode_label}")
    print(f"  연결 상태              : {'정상' if health.get('ok') else health.get('error')}")
    print("  종료하려면 Ctrl+C 를 누르세요.")
    print("=" * 60)

    with ReusableTCPServer(("127.0.0.1", port), AppHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n서버를 종료합니다.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
