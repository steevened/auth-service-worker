import { HonoApp } from "../types";
import { authRoutes } from "./auth/auth.route";

export const routes = (app: HonoApp) => {
  app.route("/auth", authRoutes);
};
