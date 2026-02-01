import { Hono } from "hono";
import { routes } from "./routes";
import { Env } from "./types";

const app = new Hono<{
  Bindings: Env;
}>();

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "ok",
  });
});



routes(app);

export default app;
