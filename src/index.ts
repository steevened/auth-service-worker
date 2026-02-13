import { Hono } from "hono";
import { routes } from "./routes";
import { AppBindings, Env } from "./types";
import { jwt } from "hono/jwt";

const app = new Hono<AppBindings>();

app.use("/api/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.SECRET,
    alg: "HS256",
  });
  return jwtMiddleware(c, next);
});

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "ok",
  });
});

routes(app);

export default app;
