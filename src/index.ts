import { Hono } from 'hono'
import { createDb } from './db/client';

type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{
  Bindings: Env;
}>()

app.get('/health', (c) => {
  const db = createDb(c.env.DATABASE_URL);
  return c.json({ 
    success: true,
    message: 'ok',
   });
})

export default app
