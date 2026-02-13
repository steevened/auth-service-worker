import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { AppBindings } from "../../types";
import * as controller from "./invitations.controller";
import {
  acceptInvitationValidator,
  sendInvitationValidator,
} from "./invitations.validators";

export const invitationsRoutes = new Hono<AppBindings>();

invitationsRoutes.post(
  "/send",
  sValidator("json", sendInvitationValidator),
  controller.sendInvitation,
);

invitationsRoutes.post(
  "/accept",
  sValidator("json", acceptInvitationValidator),
  controller.acceptInvitation,
);
