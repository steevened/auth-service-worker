import { Hono } from "hono";

export const invitationsRoutes = new Hono();

invitationsRoutes.post("/send", (c) => {
  return c.json({
    success: true,
    message: "ok",
  });
});
