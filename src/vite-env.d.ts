/// <reference types="vite/client" />

type ServerEnv = {
  // AI: import("@cloudflare/workers-types").Ai;
  // KV: import("@cloudflare/workers-types").KVNamespace;
  // DB: import("@cloudflare/workers-types").D1Database;
  STR_MESSAGE: string
}

declare type HEnv = {
  Variables: Record<string, any>,
  Bindings: ServerEnv
}