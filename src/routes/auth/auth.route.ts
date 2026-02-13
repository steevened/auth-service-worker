import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import * as controller from "./auth.controller";
import {
  loginRequestOtpValidator,
  loginVerifyOtpValidator,
  registerValidator,
  registerVerifyOtpValidator,
} from "./auth.validators";

export const authRoutes = new Hono();

authRoutes.post(
  "/login/request-otp",
  sValidator("json", loginRequestOtpValidator),
  controller.requestLoginOtp,
);
authRoutes.post(
  "/login/verify-otp",
  sValidator("json", loginVerifyOtpValidator),
  controller.validateLoginOtp,
);
authRoutes.post(
  "/register",
  sValidator("json", registerValidator),
  controller.registerUser,
);
authRoutes.post(
  "/register/validate-email",
  sValidator("json", registerVerifyOtpValidator),
  controller.validateRegisterOtp,
);
