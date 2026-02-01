import { sign } from "hono/jwt";
import { SessionPayload } from "../types";

export async function getJWTSession(
  payload: SessionPayload,
  secretKey: string,
) {
  const sessionDuration = 7 * 24 * 60 * 60 * 1000;

  const token = await sign(
    {
      sub: payload.email,
      exp: sessionDuration,
    },
    secretKey,
  );
  return token;
}
