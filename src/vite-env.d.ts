/// <reference types="vite/client" />

type WorkerEnv = {
  // AI: import("@cloudflare/workers-types").Ai;
  // KV: import("@cloudflare/workers-types").KVNamespace;
  // DB: import("@cloudflare/workers-types").D1Database;
  STR_MESSAGE: string
}

declare type HEnv<E = Record<string, any>, V = Record<string, any>> = {
  Variables: Record<string, any> & V,
  Bindings: WorkerEnv & E
}