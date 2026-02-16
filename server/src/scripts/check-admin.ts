
import { supabase } from '../config/supabase.js';

async function checkAdmin() {
    console.log('Checking admin user...');

    // 1. Check if admin exists
    const { data: admin, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .single();

    if (error) {
        console.error('Error fetching admin:', error);
        return;
    }

    if (!admin) {
        console.error('No admin user found!');
        return;
    }

    console.log('Admin user found:');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Username: ${admin.username}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Password Hash Length: ${admin.password?.length}`);
    console.log(`- Password Hash Start: ${admin.password?.substring(0, 10)}...`);

    // 2. Determine implied password from env
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    console.log(`- Env Hash Start: ${envHash?.substring(0, 10)}...`);

    if (admin.password === envHash) {
        console.log('✅ Database hash matches Environment hash.');
    } else {
        console.error('❌ Database hash DOES NOT match Environment hash!');
    }
}

checkAdmin();
