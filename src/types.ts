import { NeonQueryFunction } from "@neondatabase/serverless";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { Context, Hono, TypedResponse } from "hono";
import { BlankSchema } from "hono/types";
import { StatusCode } from "hono/utils/http-status";

export type AppDB = NeonHttpDatabase<Record<string, never>> & {
  $client: NeonQueryFunction<false, false>;
};

export type Env = {
  DATABASE_URL: string;
  SECRET: string;
};

export type HonoApp = Hono<
  {
    Bindings: Env;
  },
  BlankSchema,
  "/"
>;

export type RawResponsePayload<T = unknown> = {
  data?: T;
  error?: {
    origin?: string;
    code: string;
    format?: string;
    pattern?: string;
    path: string[];
    message: string;
  }[];
  success: boolean;
  message?: string;
};

export type RawResponse<
  T = unknown,
  Status extends StatusCode = StatusCode,
> = TypedResponse<RawResponsePayload<T>, Status, "json">;

export type SessionPayload = {
  email: string;
};

export type AppBindings = {
  Bindings: Env;
};

export type AppContext<T = unknown> = Context<
  AppBindings,
  any,
  {
    in: { json: T };
    out: { json: T };
  }
>;

export type AppHandler<T = unknown> = (
  c: AppContext<T>,
) => Response | TypedResponse<any> | Promise<Response | TypedResponse<any>>;
