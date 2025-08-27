import { Hono } from 'hono';
import { requireAdminAuth, requirePerm } from '../auth/authMidleware.js';

const app = new Hono();

// All admin routes require authenticated admin
app.use('*', requireAdminAuth);

// Example protected route requiring permission
app.post('/users', requirePerm('users.manage'), (c) => {
    return c.json({ message: 'User created' });
});

// Example route for editors/content managers
app.post('/content', requirePerm('content.manage'), (c) => {
    return c.json({ message: 'Content updated' });
});

export default app;