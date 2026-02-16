import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import creditRoutes from './routes/credits.js';
import announcementRoutes from './routes/announcements.js';
import { seedAdmin } from './utils/seedAdmin.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

// ─── Middleware ──────────────────────────────────
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/announcements', announcementRoutes);

// ─── Health Check ───────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── QR Code URL endpoint ───────────────────────
app.get('/api/qr-code', async (_req, res) => {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data } = supabase.storage
            .from('static-assets')
            .getPublicUrl('payment-qr.png');

        res.json({ qrUrl: data.publicUrl });
    } catch (error) {
        console.error('QR fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch QR code.' });
    }
});

// ─── Error Handler ──────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ───────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Form Genie Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
    console.log(`   Admin:  http://localhost:${PORT}/api/admin`);
    console.log(`   Credits:http://localhost:${PORT}/api/credits\n`);

    // Seed/update admin credentials from env vars
    seedAdmin();
});
