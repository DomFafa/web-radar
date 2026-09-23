import { DatabaseSync } from "node:sqlite";
export function d1(sqlite: DatabaseSync) {
  return {
    prepare(sql: string) {
      const build = (params: any[] = []): any => ({
        sql, params,
        bind: (...values: any[]) => build(values),
        async raw() { const stmt = sqlite.prepare(sql); stmt.setReturnArrays(true); return stmt.all(...params); },
        async all() { return { results: sqlite.prepare(sql).all(...params) }; },
        async first() { return sqlite.prepare(sql).get(...params) || null; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } }; },
      });
      return build();
    },
    async batch(statements: any[]) {
      sqlite.exec("BEGIN");
      try {
        const result = statements.map(({ sql, params }) => /^\s*SELECT/i.test(sql)
          ? { results: sqlite.prepare(sql).all(...params), meta: { changes: 0 } }
          : { results: [], meta: { changes: Number(sqlite.prepare(sql).run(...params).changes) } });
        sqlite.exec("COMMIT");
        return result;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
}
