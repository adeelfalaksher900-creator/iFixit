import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
export function database(path = ":memory:") {
  const db = new DatabaseSync(path);
  db.exec(fs.readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  function wrap(sql, args = []) {
    return {
      bind(...values) {
        return wrap(sql, values);
      },
      async first() {
        return db.prepare(sql).get(...args) || null;
      },
      async all() {
        return { results: db.prepare(sql).all(...args) };
      },
      async run() {
        const result = db.prepare(sql).run(...args);
        return { meta: { changes: Number(result.changes) } };
      },
    };
  }
  return {
    prepare: (sql) => wrap(sql),
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const result = [];
        for (const s of statements) result.push(await s.run());
        db.exec("COMMIT");
        return result;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    close() {
      db.close();
    },
  };
}
