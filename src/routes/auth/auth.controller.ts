import { Context } from "hono";
import { RawResponse } from "../../types";
import * as service from "./auth.service";

export const requestLoginOtp = async (c: Context): Promise<RawResponse> => {
  const { email } = c.req.valid("json" as never);
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.requestLoginOtp({ email, dbUrl });
  switch (result.type) {
    case "OTP_SENT":
    case "USER_NOT_FOUND":
      return c.json({
        success: true,
        message: "OTP has been sent to user if exists",
      });
    case "ACTIVE_OTP_EXISTS":
      return c.json(
        { success: false, message: "User already has an active OTP" },
        400,
      );
  }
};

export const validateLoginOtp = async (c: Context): Promise<RawResponse> => {
  return await service.validateLoginOtp(c);
};
