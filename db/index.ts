import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  try {
    if (env && env.DB) {
      return drizzle(env.DB, { schema });
    }
  } catch {
    // Fall back to in-memory mock if D1 is unavailable
  }

  console.warn("[AI Studio] Database not connected — using mock");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: Record<string, unknown>) => (d as { data?: unknown })?.data ?? {},
    update: async (d: Record<string, unknown>) => (d as { data?: unknown })?.data ?? {},
    delete: async () => ({}),
  };
  return new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === "query"
          ? new Proxy({}, { get: () => noOp })
          : () => {
              const chain: unknown = new Proxy(
                {},
                {
                  get: (_t, p) => {
                    if (
                      p === "from" ||
                      p === "select" ||
                      p === "where" ||
                      p === "orderBy" ||
                      p === "limit" ||
                      p === "values" ||
                      p === "returning"
                    ) {
                      return () => chain;
                    }
                    if (p === "then") {
                      return (resolve: (val: unknown[]) => void) => resolve([]);
                    }
                    return () => chain;
                  },
                }
              );
              return chain;
            },
    }
  ) as ReturnType<typeof drizzle>;
}
