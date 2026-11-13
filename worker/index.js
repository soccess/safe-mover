const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS learning_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT NOT NULL,
    class_name TEXT NOT NULL DEFAULT '기본반',
    character_id TEXT NOT NULL DEFAULT 'bunny',
    student_name TEXT NOT NULL DEFAULT '토끼',
    stage TEXT NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_learning_records_game_id ON learning_records (game, id DESC)`,
  `CREATE TABLE IF NOT EXISTS classes (
    name TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )`,
  `INSERT OR IGNORE INTO classes (name) VALUES ('기본반')`,
  `CREATE TABLE IF NOT EXISTS kv_state (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )`,
];

const MIGRATION_STATEMENTS = [
  `ALTER TABLE learning_records ADD COLUMN class_name TEXT NOT NULL DEFAULT '기본반'`,
  `ALTER TABLE learning_records ADD COLUMN character_id TEXT NOT NULL DEFAULT 'bunny'`,
  `CREATE INDEX IF NOT EXISTS idx_learning_records_class_game ON learning_records (class_name, game, id DESC)`,
];

let schemaReady = false;

async function ensureSchema(db) {
  if (schemaReady) return;
  for (const sql of SCHEMA_STATEMENTS) {
    await db.prepare(sql).run();
  }
  for (const sql of MIGRATION_STATEMENTS) {
    try {
      await db.prepare(sql).run();
    } catch (_) {
      // 이미 컬럼/인덱스가 존재하는 경우 무시
    }
  }
  schemaReady = true;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(request, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(),
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB;

    if (!db) {
      return jsonResponse(request, { ok: false, error: "D1 binding 'DB' is missing" }, 500);
    }

    try {
      if (request.method === "GET" && (path === "/" || path === "/api/health")) {
        await ensureSchema(db);
        const row = await db.prepare("SELECT 1 AS ok, datetime('now', '+9 hours') AS server_time").first();
        return jsonResponse(request, {
          ok: true,
          mode: "cloudflare-d1",
          db_name: "safe-mover-db",
          server_time: row ? row.server_time : null,
        });
      }

      if (request.method === "POST" && path === "/api/init") {
        schemaReady = false;
        await ensureSchema(db);
        const row = await db.prepare("SELECT datetime('now', '+9 hours') AS server_time").first();
        return jsonResponse(request, {
          ok: true,
          health: {
            ok: true,
            mode: "cloudflare-d1",
            db_name: "safe-mover-db",
            server_time: row ? row.server_time : null,
          },
        });
      }

      // 반(Class) 목록 조회
      if (request.method === "GET" && path === "/api/classes") {
        await ensureSchema(db);
        const res = await db
          .prepare(
            "SELECT name, created_at FROM classes " +
            "UNION SELECT DISTINCT class_name AS name, '' AS created_at FROM learning_records WHERE class_name <> '' " +
            "ORDER BY name ASC"
          )
          .all();
        const names = [];
        const seen = new Set();
        for (const r of res.results || []) {
          const n = String(r.name || "").trim();
          if (n && !seen.has(n)) {
            seen.add(n);
            names.push({ name: n, created_at: r.created_at || "" });
          }
        }
        if (!seen.has("기본반")) names.unshift({ name: "기본반", created_at: "" });
        return jsonResponse(request, { ok: true, classes: names });
      }

      // 반(Class) 추가/저장
      if (request.method === "POST" && path === "/api/classes") {
        await ensureSchema(db);
        const body = await request.json().catch(() => ({}));
        const name = String(body.name || "").trim().slice(0, 40);
        if (!name) {
          return jsonResponse(request, { ok: false, error: "class name is required" }, 400);
        }
        await db
          .prepare("INSERT OR IGNORE INTO classes (name) VALUES (?)")
          .bind(name)
          .run();
        return jsonResponse(request, { ok: true, name, mode: "cloudflare-d1" }, 201);
      }

      // 반(Class) 삭제
      if (request.method === "DELETE" && path === "/api/classes") {
        await ensureSchema(db);
        const name = (url.searchParams.get("name") || "").trim();
        if (!name || name === "기본반") {
          return jsonResponse(request, { ok: false, error: "cannot delete default class" }, 400);
        }
        await db.prepare("DELETE FROM classes WHERE name = ?").bind(name).run();
        return jsonResponse(request, { ok: true, deleted: name });
      }

      // 학습 기록 조회
      if (request.method === "GET" && path === "/api/records") {
        await ensureSchema(db);
        const game = (url.searchParams.get("game") || "").trim();
        const className = (url.searchParams.get("class_name") || "").trim();
        const characterId = (url.searchParams.get("character_id") || "").trim();
        const rawLimit = Number.parseInt(url.searchParams.get("limit") || "50", 10);
        const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(200, rawLimit)) : 50;

        const where = [];
        const binds = [];
        if (game) {
          where.push("game = ?");
          binds.push(game);
        }
        if (className) {
          where.push("class_name = ?");
          binds.push(className);
        }
        if (characterId) {
          where.push("character_id = ?");
          binds.push(characterId);
        }
        const whereSql = where.length ? "WHERE " + where.join(" AND ") + " " : "";
        binds.push(limit);

        const result = await db
          .prepare(
            "SELECT id, game, class_name, character_id, student_name, stage, score, summary, payload_json, created_at " +
            "FROM learning_records " +
            whereSql +
            "ORDER BY id DESC LIMIT ?"
          )
          .bind(...binds)
          .all();

        return jsonResponse(request, { ok: true, records: result.results || [] });
      }

      // 학습 기록 저장
      if (request.method === "POST" && path === "/api/records") {
        await ensureSchema(db);
        const body = await request.json().catch(() => ({}));
        const game = String(body.game || "unknown").slice(0, 40);
        const className = String(body.class_name || "기본반").trim().slice(0, 40) || "기본반";
        const characterId = String(body.character_id || "bunny").trim().slice(0, 40) || "bunny";
        const studentName = String(body.student_name || "토끼").slice(0, 60);
        const stage = String(body.stage || "").slice(0, 120);
        const score = Number.parseInt(String(body.score ?? 0), 10) || 0;
        const summary = String(body.summary || "").slice(0, 300);
        const payloadObj = body.payload !== undefined && body.payload !== null ? body.payload : {};
        const payloadJson = JSON.stringify(payloadObj).slice(0, 8000);

        await db.prepare("INSERT OR IGNORE INTO classes (name) VALUES (?)").bind(className).run();

        const res = await db
          .prepare(
            "INSERT INTO learning_records (game, class_name, character_id, student_name, stage, score, summary, payload_json) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(game, className, characterId, studentName, stage, score, summary, payloadJson)
          .run();

        return jsonResponse(
          request,
          {
            ok: true,
            id: res.meta ? res.meta.last_row_id : null,
            mode: "cloudflare-d1",
          },
          201
        );
      }

      // 학습 기록 수정 (교사 모드)
      if (request.method === "PATCH" && path === "/api/records") {
        await ensureSchema(db);
        const body = await request.json().catch(() => ({}));
        const id = Number.parseInt(String(body.id ?? ""), 10);
        if (!Number.isFinite(id) || id <= 0) {
          return jsonResponse(request, { ok: false, error: "valid record id is required" }, 400);
        }
        const sets = [];
        const binds = [];
        if (body.class_name !== undefined) {
          const cn = String(body.class_name).trim().slice(0, 40) || "기본반";
          sets.push("class_name = ?");
          binds.push(cn);
        }
        if (body.character_id !== undefined) {
          sets.push("character_id = ?");
          binds.push(String(body.character_id).trim().slice(0, 40));
        }
        if (body.student_name !== undefined) {
          sets.push("student_name = ?");
          binds.push(String(body.student_name).trim().slice(0, 60));
        }
        if (body.stage !== undefined) {
          sets.push("stage = ?");
          binds.push(String(body.stage).slice(0, 120));
        }
        if (body.score !== undefined) {
          sets.push("score = ?");
          binds.push(Number.parseInt(String(body.score), 10) || 0);
        }
        if (body.summary !== undefined) {
          sets.push("summary = ?");
          binds.push(String(body.summary).slice(0, 300));
        }
        if (!sets.length) {
          return jsonResponse(request, { ok: false, error: "no fields to update" }, 400);
        }
        binds.push(id);
        await db.prepare(`UPDATE learning_records SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
        return jsonResponse(request, { ok: true, id, mode: "cloudflare-d1" });
      }

      // 학습 기록 삭제 (교사 모드)
      if (request.method === "DELETE" && path === "/api/records") {
        await ensureSchema(db);
        const idRaw = url.searchParams.get("id");
        if (idRaw) {
          const id = Number.parseInt(idRaw, 10);
          if (!Number.isFinite(id) || id <= 0) {
            return jsonResponse(request, { ok: false, error: "invalid id" }, 400);
          }
          await db.prepare("DELETE FROM learning_records WHERE id = ?").bind(id).run();
          return jsonResponse(request, { ok: true, deletedId: id });
        }

        const game = (url.searchParams.get("game") || "").trim();
        const className = (url.searchParams.get("class_name") || "").trim();
        const allFlag = url.searchParams.get("all") === "1";

        if (!game && !className && !allFlag) {
          return jsonResponse(request, { ok: false, error: "specify id, game, class_name, or all=1" }, 400);
        }

        const where = [];
        const binds = [];
        if (game) {
          where.push("game = ?");
          binds.push(game);
        }
        if (className) {
          where.push("class_name = ?");
          binds.push(className);
        }
        const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
        const res = await db.prepare(`DELETE FROM learning_records ${whereSql}`).bind(...binds).run();
        return jsonResponse(request, {
          ok: true,
          deletedCount: res.meta && res.meta.changes ? res.meta.changes : 0,
        });
      }

      if (request.method === "GET" && path === "/api/kv") {
        await ensureSchema(db);
        const key = (url.searchParams.get("key") || "").trim();
        if (!key) {
          return jsonResponse(request, { ok: false, error: "key parameter is required" }, 400);
        }
        const row = await db
          .prepare("SELECT k, v, updated_at FROM kv_state WHERE k = ?")
          .bind(key)
          .first();
        return jsonResponse(request, { ok: true, found: Boolean(row), item: row || null });
      }

      if (request.method === "POST" && path === "/api/kv") {
        await ensureSchema(db);
        const body = await request.json().catch(() => ({}));
        const key = String(body.key || "").trim().slice(0, 120);
        if (!key) {
          return jsonResponse(request, { ok: false, error: "key is required" }, 400);
        }
        const val = body.value;
        const valStr = typeof val === "string" ? val : JSON.stringify(val ?? null);

        await db
          .prepare(
            "INSERT INTO kv_state (k, v, updated_at) VALUES (?, ?, datetime('now', '+9 hours')) " +
            "ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = datetime('now', '+9 hours')"
          )
          .bind(key, valStr)
          .run();

        return jsonResponse(request, { ok: true, mode: "cloudflare-d1" });
      }

      return jsonResponse(request, { ok: false, error: "Not found" }, 404);
    } catch (err) {
      return jsonResponse(
        request,
        { ok: false, error: err && err.message ? err.message : String(err) },
        500
      );
    }
  },
};
