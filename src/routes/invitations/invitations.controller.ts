import {
  AppContext,
  AppHandler,
  RawResponse,
  RequestPayload,
} from "../../types";
import * as service from "./invitations.service";
import {
  SendInvitationInput,
  AcceptInvitationInput,
} from "./invitations.validators";

export const sendInvitation: AppHandler<SendInvitationInput> = async (
  c: AppContext<SendInvitationInput>,
): Promise<RawResponse> => {
  const payload = c.get("jwtPayload") as RequestPayload;
  const { email, role } = c.req.valid("json");
  const dbUrl = c.env.DATABASE_URL;
  const secret = c.env.SECRET;
  const result = await service.sendInvitation(
    payload,
    { email, role },
    dbUrl,
    secret,
  );
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

export const acceptInvitation: AppHandler<AcceptInvitationInput> = async (
  c: AppContext<AcceptInvitationInput>,
): Promise<RawResponse> => {
  const data = c.req.valid("json");
  const dbUrl = c.env.DATABASE_URL;
  const result = await service.acceptInvitation(data, dbUrl);
  switch (result.type) {
    case "INVITATION_NOT_FOUND":
      return c.json({ success: false, message: "Invitation not found" }, 404);
    case "INVITATION_ACCEPTED":
      return c.json({
        success: true,
        message: "Invitation accepted successfully",
      })
    case "INVITATION_NOT_FOUND":
      return c.json({ success: false, message: "Invitation not found" }, 404);
    case "USER_EXISTS":
      return c.json({ success: false, message: "User already exists" }, 400);
    case "INVITATION_NOT_ACCEPTED":
      return c.json(
        { success: false, message: "Invitation not accepted" },
        500,
      );
  }
  return c.json({ success: false, message: "Something went wrong" }, 500);
};
