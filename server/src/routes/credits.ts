import { Router, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { requireApproved } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(requireApproved);

// ─── GET /balance ─────────────────────────────────
router.get('/balance', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Admin has unlimited
        if (req.user!.role === 'admin') {
            res.json({ credits: 999999, unlimited: true });
            return;
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('credits')
            .eq('id', req.user!.id)
            .single();

        if (error || !user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }

        res.json({ credits: user.credits, unlimited: false });
    } catch (error: any) {
        console.error('Balance error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── POST /deduct ─────────────────────────────────
router.post('/deduct', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { count = 1 } = req.body;
        const deductAmount = Math.max(1, parseInt(count) || 1);

        // Admin bypasses credit check
        if (req.user!.role === 'admin') {
            res.json({
                success: true,
                credits: 999999,
                unlimited: true,
                message: 'Admin — unlimited credits.'
            });
            return;
        }

        // Get current credits
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', req.user!.id)
            .single();

        if (fetchError || !user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }

        if (user.credits < deductAmount) {
            res.status(403).json({
                error: 'Insufficient credits. Please purchase more to continue.',
                credits: user.credits
            });
            return;
        }

        const newCredits = user.credits - deductAmount;

        const { error } = await supabase
            .from('users')
            .update({ credits: newCredits })
            .eq('id', req.user!.id);

        if (error) {
            res.status(500).json({ error: 'Failed to deduct credits.' });
            return;
        }

        // Log deduction
        await supabase.from('credit_logs').insert({
            user_id: req.user!.id,
            credits_added: 0,
            credits_deducted: deductAmount,
            action_by: 'system',
            reason: `Form automation submission (x${deductAmount})`,
        });

        res.json({
            success: true,
            credits: newCredits,
            unlimited: false,
            message: `${deductAmount} credit(s) deducted. Remaining: ${newCredits}`
        });
    } catch (error: any) {
        console.error('Deduct error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── GET /logs ─────────────────────────────────
router.get('/logs', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data: logs, error } = await supabase
            .from('credit_logs')
            .select('*')
            .eq('user_id', req.user!.id)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) {
            res.status(500).json({ error: 'Failed to fetch credit logs.' });
            return;
        }

        res.json({ logs: logs || [] });
    } catch (error: any) {
        console.error('Credit logs error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
