import { sValidator } from "@hono/standard-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "./db/client";
import { users } from "./db/schema/users";
import { loginSchema } from "./routeSchemas/route-schemas";
import { RawResponse } from "./types";


type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{
  Bindings: Env;
}>();

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "ok",
  });
});

app.post("/auth/login", sValidator("json", loginSchema), async (c): Promise<RawResponse> => {
  const { email, password } = c.req.valid("json");
  
  const db = createDb(c.env.DATABASE_URL);

  const [user] = await db
    .select({ userId: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({
      success: false,
      message: "User not found",
    }, 404);
  }

  return c.json({
    success: true,
    message: "Passed validator",
    data: {
      email,
      password,
    }
  });
});

app.get("/login", (c) => {
  return c.json({ message: "Login endpoint" });
});

export default app;
