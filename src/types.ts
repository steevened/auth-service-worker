import type { TypedResponse } from "hono";
import { StatusCode } from "hono/utils/http-status";

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
