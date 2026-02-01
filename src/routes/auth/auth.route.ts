import { Hono } from "hono";
import * as controller from "./auth.controller";
import { sValidator } from "@hono/standard-validator";
import {
  loginRequestOtpSchema,
  loginVerifyOtpSchema,
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
