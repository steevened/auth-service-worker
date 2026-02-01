import { Hono } from "hono";
import * as controller from "./auth.controller";
import { sValidator } from "@hono/standard-validator";
import {
  loginRequestOtpSchema,
  loginVerifyOtpSchema,
  registerSchema,
  registerVerifyOtpSchema,
} from "../../routeSchemas/route-schemas";

export const authRoutes = new Hono();

authRoutes.post(
  "/login/request-otp",
  sValidator("json", loginRequestOtpSchema),
  controller.requestLoginOtp,
);
authRoutes.post(
  "/login/verify-otp",
  sValidator("json", loginVerifyOtpSchema),
  controller.validateLoginOtp,
);
authRoutes.post(
  "/register",
  sValidator("json", registerSchema),
  controller.registerUser,
);
authRoutes.post(
  "/register/validate-email",
  sValidator("json", registerVerifyOtpSchema),
  controller.validateRegisterOtp,
);
