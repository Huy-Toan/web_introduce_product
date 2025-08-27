import { Hono } from 'hono';
import { auth, requireAnyRole } from '../auth/authMidleware';

const app = new Hono();

// Áp dụng authentication cho tất cả routes admin
app.use('*', auth);

// Dashboard - chỉ admin roles mới truy cập được
app.get('/dashboard', requireAnyRole(['superadmin', 'admin', 'content_manager', 'user_manager', 'moderator', 'editor', 'finance', 'auditor']), (c) => {
    const user = c.get('user');
    return c.json({
        message: 'Welcome to admin dashboard',
        user: {
            email: user.email,
            role: user.role
        }
    });
});

// Quản lý người dùng - chỉ superadmin, admin, user_manager
app.use('/users/*', requireAnyRole(['superadmin', 'admin', 'user_manager']));
app.get('/users', (c) => {
    return c.json({ message: 'User management panel' });
});

// Quản lý nội dung - content_manager, editor, admin, superadmin
app.use('/content/*', requireAnyRole(['superadmin', 'admin', 'content_manager', 'editor']));
app.get('/content', (c) => {
    return c.json({ message: 'Content management panel' });
});

// Quản lý tài chính - finance, admin, superadmin
app.use('/finance/*', requireAnyRole(['superadmin', 'admin', 'finance']));
app.get('/finance', (c) => {
    return c.json({ message: 'Finance management panel' });
});

export default app;