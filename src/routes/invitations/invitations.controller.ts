import {
  AppContext,
  AppHandler,
  RawResponse,
  RequestPayload,
} from "../../types";
import * as service from "./invitations.service";
import { SendInvitationInput } from "./invitations.validators";

export const sendInvitation: AppHandler<SendInvitationInput> = async (
  c: AppContext<SendInvitationInput>,
): Promise<RawResponse> => {
  const payload = c.get("jwtPayload") as RequestPayload;
  const { email, role } = c.req.valid("json");
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.sendInvitation(payload, { email, role }, dbUrl);
  switch (result.type) {
    case "UNAUTHORIZED":
      return c.json({ success: false, message: "Unauthorized" }, 401);
    case "FORBIDDEN":
      return c.json({ success: false, message: "Forbidden" }, 403);
    case "USER_EXISTS":
      return c.json({ success: false, message: "User already exists" }, 400);
    case "INVITATION_EXISTS":
      return c.json(
        { success: false, message: "Invitation already exists" },
        400,
      );
    case "INVITATION_SENT":
      return c.json({ success: true, message: "Invitation sent successfully" });
    case "INVITATION_NOT_SENT":
      return c.json({ success: false, message: "Invitation not sent" }, 500);
  }
};
