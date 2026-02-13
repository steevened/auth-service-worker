import { AppContext, AppHandler, RawResponse } from "../../types";
import * as service from "./invitations.service";
import { SendInvitationInput } from "./invitations.validators";

export const sendInvitation: AppHandler<SendInvitationInput> = async (
  c: AppContext<SendInvitationInput>,
): Promise<RawResponse> => {
  const { email, role } = c.req.valid("json");
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.sendInvitation({ email, role }, dbUrl);
  switch (result.type) {
    case "USER_EXISTS":
      return c.json({ success: false, message: "User already exists" }, 400);
    case "INVITATION_SENT":
      return c.json({ success: true, message: "Invitation sent successfully" });
    case "INVITATION_NOT_SENT":
      return c.json({ success: false, message: "Invitation not sent" }, 500);
  }
};
