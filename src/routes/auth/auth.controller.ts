import { Context } from "hono";
import { RawResponse } from "../../types";
import * as service from "./auth.service";

export const requestLoginOtp = async (c: Context): Promise<RawResponse> => {
  const { email } = c.req.valid("json" as never);
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.requestLoginOtp({ email, dbUrl });
  switch (result.type) {
    case "USER_NOT_FOUND":
      return c.json({ success: false, message: "User not found" }, 400);
    case "OTP_SENT":
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

export const validateLoginOtp = async (
  c: Context,
): Promise<RawResponse<{ token: string }>> => {
  const { email, otp } = c.req.valid("json" as never);
  const dbUrl = c.env.DATABASE_URL;
  const secret = c.env.SECRET;
  const result = await service.validateLoginOtp({ email, otp, dbUrl, secret });
  switch (result.type) {
    case "OTP_INVALID":
      return c.json({ success: false, message: "Invalid OTP" }, 400);
    case "OTP_EXPIRED":
      return c.json({ success: false, message: "OTP has expired" }, 400);
    case "OTP_ACTIVE":
      return c.json(
        { success: false, message: "User already has an active OTP" },
        400,
      );
    case "OTP_VALID":
      return c.json({ success: true, data: { token: result.data.token } });
  }
};

export const registerUser = async (c: Context): Promise<RawResponse> => {
  const { email } = c.req.valid("json" as never);
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.registerUser(email, dbUrl);
  switch (result.type) {
    case "USER_EXISTS":
      return c.json({ success: false, message: "User already exists" }, 400);
    case "USER_CREATED":
      return c.json({ success: true, message: "User created successfully" });
    case "USER_NOT_CREATED":
      return c.json({ success: false, message: "User not created" }, 500);
  }
  return c.json({ success: false, message: "Something went wrong" }, 500);
};

export const validateRegisterOtp = async (
  c: Context,
): Promise<RawResponse<{ token: string }>> => {
  const { email, otp } = c.req.valid("json" as never);
  const dbUrl = c.env.DATABASE_URL;
  const secret = c.env.SECRET;
  const result = await service.validateRegisterOtp({
    email,
    otp,
    dbUrl,
    secret,
  });
  switch (result.type) {
    case "OTP_INVALID":
      return c.json({ success: false, message: "Invalid OTP" }, 400);
    case "OTP_EXPIRED":
      return c.json({ success: false, message: "OTP has expired" }, 400);
    case "OTP_ACTIVE":
      return c.json(
        { success: false, message: "User already has an active OTP" },
        400,
      );
    case "OTP_VALID":
      return c.json({ success: true, data: { token: result.data.token } });
  }
};
