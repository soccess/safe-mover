const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS learning_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT NOT NULL,
    student_name TEXT NOT NULL DEFAULT '기본 학생',
    stage TEXT NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL DEFAULT '',
    payload_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_learning_records_game_id ON learning_records (game, id DESC)`,
  `CREATE TABLE IF NOT EXISTS kv_state (
    k TEXT PRIMARY KEY,
    v TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
  )`,
];

let schemaReady = false;

async function ensureSchema(db) {
  if (schemaReady) return;
  for (const sql of SCHEMA_STATEMENTS) {
    await db.prepare(sql).run();
  }
  schemaReady = true;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

      if (request.method === "GET" && path === "/api/records") {
        await ensureSchema(db);
        const game = (url.searchParams.get("game") || "").trim();
        const rawLimit = Number.parseInt(url.searchParams.get("limit") || "30", 10);
        const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, rawLimit)) : 30;

        let result;
        if (game) {
          result = await db
            .prepare(
              "SELECT id, game, student_name, stage, score, summary, payload_json, created_at " +
              "FROM learning_records WHERE game = ? ORDER BY id DESC LIMIT ?"
            )
            .bind(game, limit)
            .all();
        } else {
          result = await db
            .prepare(
              "SELECT id, game, student_name, stage, score, summary, payload_json, created_at " +
              "FROM learning_records ORDER BY id DESC LIMIT ?"
            )
            .bind(limit)
            .all();
        }
        return jsonResponse(request, { ok: true, records: result.results || [] });
      }

      if (request.method === "POST" && path === "/api/records") {
        await ensureSchema(db);
        const body = await request.json().catch(() => ({}));
        const game = String(body.game || "unknown").slice(0, 40);
        const studentName = String(body.student_name || "기본 학생").slice(0, 60);
        const stage = String(body.stage || "").slice(0, 120);
        const score = Number.parseInt(String(body.score ?? 0), 10) || 0;
        const summary = String(body.summary || "").slice(0, 300);
        const payloadObj = body.payload !== undefined && body.payload !== null ? body.payload : {};
        const payloadJson = JSON.stringify(payloadObj).slice(0, 8000);

        const res = await db
          .prepare(
            "INSERT INTO learning_records (game, student_name, stage, score, summary, payload_json) " +
            "VALUES (?, ?, ?, ?, ?, ?)"
          )
          .bind(game, studentName, stage, score, summary, payloadJson)
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
