import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

const USERNAME = 'admin';
// Generate a hash with: bcrypt.hashSync('yourpassword', 10)
const PASSWORD_HASH = '$2b$10$UPp4AitzN.HpgcstnZKk8e09aGlQWsA6DIV3tcRFedvKxfw2EjhlS'; // <-- replace with your hash

export async function POST({ request }) {
    const { username, password } = await request.json();

    if (username === USERNAME && bcrypt.compareSync(password, PASSWORD_HASH)) {
        return new Response(null, {
            status: 200,
            headers: {
                'set-cookie': cookie.serialize('session', 'valid', {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 // 1 day
                })
            }
        });
    }
    return json({ error: 'Unauthorized' }, { status: 401 });
}