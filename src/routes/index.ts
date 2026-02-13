import { HonoApp } from "../types";
import { authRoutes } from "./auth/auth.route";
import { invitationsRoutes } from "./invitations/invitations.route";

export const routes = (app: HonoApp) => {
  app.route("/auth", authRoutes);
  app.route("/invitations", invitationsRoutes);
};
