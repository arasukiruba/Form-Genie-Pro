import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js';
import { sendRegistrationEmail } from '../services/emailService.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Plan credit mapping
const PLAN_CREDITS: Record<string, number> = {
    starter: 150,
    pro: 300,
    executive: 500,
};

const PLAN_AMOUNTS: Record<string, number> = {
    starter: 100,
    pro: 180,
    executive: 300,
};

// ─── POST /register ─────────────────────────────────
router.post('/register', upload.single('screenshot'), async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, contact_number, email, username, password, plan, transaction_id } = req.body;

        // Validate required fields
        if (!name || !contact_number || !email || !username || !password || !plan || !transaction_id) {
            res.status(400).json({ error: 'All fields are required.' });
            return;
        }

        // Validate plan
        if (!PLAN_CREDITS[plan]) {
            res.status(400).json({ error: 'Invalid plan selected.' });
            return;
        }

        // Check existing username
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            res.status(409).json({ error: 'Username already exists.' });
            return;
        }

        // Check existing email
        const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingEmail) {
            res.status(409).json({ error: 'Email already registered.' });
            return;
        }

        // Check transaction ID uniqueness
        const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('transaction_id', transaction_id)
            .single();

        if (existingTx) {
            res.status(409).json({ error: 'Transaction ID already used.' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Upload screenshot to Supabase Storage
        let screenshotUrl = '';
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${username}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                res.status(500).json({ error: 'Failed to upload screenshot.' });
                return;
            }

            const { data: urlData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(fileName);

            screenshotUrl = urlData.publicUrl;
        }

        // Create user
        const credits = PLAN_CREDITS[plan];
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
                name,
                contact_number,
                email,
                username,
                password: hashedPassword,
                role: 'user',
                plan,
                credits,
                status: 'pending',
            })
            .select('id')
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            res.status(500).json({ error: 'Failed to create user account.' });
            return;
        }

        // Create transaction record
        await supabase.from('transactions').insert({
            user_id: newUser.id,
            transaction_id,
            screenshot_url: screenshotUrl,
            plan,
            amount: PLAN_AMOUNTS[plan],
            status: 'pending',
        });

        // Log initial credits
        await supabase.from('credit_logs').insert({
            user_id: newUser.id,
            credits_added: credits,
            credits_deducted: 0,
            action_by: 'system',
            reason: `Registration - ${plan} plan`,
        });

        // Send email to admin
        await sendRegistrationEmail({
            name,
            email,
            contact: contact_number,
            plan,
            transactionId: transaction_id,
            screenshotUrl,
        });

        res.status(201).json({
            message: 'Registration successful! Your account is pending admin approval.',
            userId: newUser.id,
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── POST /login ─────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required.' });
            return;
        }

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            res.status(401).json({ error: 'Invalid username or password.' });
            return;
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid username or password.' });
            return;
        }

        // Check status
        if (user.status === 'pending') {
            res.status(403).json({
                error: 'Your account is awaiting admin approval.',
                status: 'pending',
            });
            return;
        }

        if (user.status === 'rejected') {
            res.status(403).json({
                error: 'Your registration was rejected. Please contact support.',
                status: 'rejected',
            });
            return;
        }

        if (user.status === 'disabled') {
            res.status(403).json({
                error: 'Your account has been disabled. Please contact support.',
                status: 'disabled',
            });
            return;
        }

        // Generate JWT
        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status,
        });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                plan: user.plan,
                credits: user.credits,
                status: user.status,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ─── GET /me ─────────────────────────────────
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, contact_number, email, username, role, plan, credits, status, created_at')
            .eq('id', req.user!.id)
            .single();

        if (error || !user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }

        res.json({ user });
    } catch (error: any) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

export default router;
