import { Router, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

// ─── GET /api/announcements — Public for authenticated users ───
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Fetch announcements error:', error);
            res.status(500).json({ error: 'Failed to fetch announcements.' });
            return;
        }

        res.json({ announcements: data || [] });
    } catch (error: any) {
        console.error('Announcements error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── GET /api/announcements/all — Admin sees all (incl. inactive) ───
router.get('/all', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            res.status(500).json({ error: 'Failed to fetch announcements.' });
            return;
        }

        res.json({ announcements: data || [] });
    } catch (error: any) {
        console.error('Admin announcements error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── POST /api/announcements — Admin creates announcement ───
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, message, type = 'info' } = req.body;

        if (!title || !message) {
            res.status(400).json({ error: 'Title and message are required.' });
            return;
        }

        const { data, error } = await supabase
            .from('announcements')
            .insert({
                title,
                message,
                type, // 'info' | 'warning' | 'success' | 'urgent'
                active: true,
                created_by: req.user!.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ error: 'Failed to create announcement.' });
            return;
        }

        res.status(201).json({ announcement: data });
    } catch (error: any) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── DELETE /api/announcements/:id — Admin deletes announcement ───
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete announcement.' });
            return;
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── PATCH /api/announcements/:id/toggle — Toggle active status ───
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get current status
        const { data: ann, error: fetchError } = await supabase
            .from('announcements')
            .select('active')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !ann) {
            res.status(404).json({ error: 'Announcement not found.' });
            return;
        }

        const { error } = await supabase
            .from('announcements')
            .update({ active: !ann.active })
            .eq('id', req.params.id);

        if (error) {
            res.status(500).json({ error: 'Failed to toggle announcement.' });
            return;
        }

        res.json({ success: true, active: !ann.active });
    } catch (error: any) {
        console.error('Toggle announcement error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
