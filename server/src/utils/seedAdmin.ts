import { supabase } from '../config/supabase.js';

/**
 * Seeds or updates the admin user from environment variables.
 * Credentials are stored as bcrypt hashes in .env — never in plain text.
 *
 * Required env vars:
 *   ADMIN_USERNAME   — admin login username
 *   ADMIN_PASSWORD_HASH — bcrypt hash of admin password
 *   ADMIN_EMAIL      — admin email address
 */
export async function seedAdmin(): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const email = process.env.ADMIN_EMAIL;

    if (!username || !passwordHash) {
        console.warn('⚠️  ADMIN_USERNAME or ADMIN_PASSWORD_HASH not set — skipping admin seed.');
        return;
    }

    try {
        // Check if admin already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id, username')
            .eq('role', 'admin')
            .single();

        if (existing) {
            // Update existing admin credentials
            const { error } = await supabase
                .from('users')
                .update({
                    username,
                    password: passwordHash,
                    email: email || existing.username,
                })
                .eq('id', existing.id);

            if (error) {
                console.error('❌ Failed to update admin:', error.message);
            } else {
                console.log(`✅ Admin credentials updated (username: ${username})`);
            }
        } else {
            // Create new admin user
            const { error } = await supabase
                .from('users')
                .insert({
                    name: 'Administrator',
                    contact_number: '0000000000',
                    email: email || 'admin@formgenie.app',
                    username,
                    password: passwordHash,
                    role: 'admin',
                    credits: 999999,
                    status: 'approved',
                });

            if (error) {
                console.error('❌ Failed to seed admin:', error.message);
            } else {
                console.log(`✅ Admin user created (username: ${username})`);
            }
        }
    } catch (err: any) {
        console.error('❌ Admin seed error:', err.message);
    }
}
