import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator'
import { insertUserSchema } from './db/schema/users';

type Env = {
  DATABASE_URL: string;
};

const app = new Hono<{
  Bindings: Env;
}>()

app.get('/health', (c) => {
  return c.json({ 
    success: true,
    message: 'ok',

   });
})

app.post('/auth/login', sValidator('json', insertUserSchema), (c) => {
  return c.json({ message: 'Login endpoint' });
})

app.get('/login', (c) => {
  return c.json({ message: 'Login endpoint' });
});



export default app
