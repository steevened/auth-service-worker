import { sign } from "hono/jwt";
import { SessionPayload } from "../types";

export async function getJWTSession(
  payload: SessionPayload,
  secretKey: string,
) {
  const sessionDurationInSeconds = 7 * 24 * 60 * 60
  const expirationTime = Math.floor(Date.now() / 1000) + sessionDurationInSeconds

  const token = await sign(
    {
      sub: payload.email,
      exp: expirationTime,
    },
    secretKey,
  );
  return token;
}
