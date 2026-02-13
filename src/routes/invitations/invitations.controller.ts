import { AppContext, AppHandler, RawResponse } from "../../types";
import * as service from "./invitations.service";
import { SendInvitationInput } from "./invitations.validators";

export const sendInvitation: AppHandler<SendInvitationInput> = async (
  c: AppContext<SendInvitationInput>,
): Promise<RawResponse> => {
  const { email, role } = c.req.valid("json");
  const dbUrl = c.env.DATABASE_URL;
  await service.sendInvitation({ email, role }, dbUrl);
  return c.json({ success: true, message: "Invitation sent successfully" });
};
