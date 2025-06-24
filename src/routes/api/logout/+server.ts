import cookie from 'cookie';

export async function POST() {
    return new Response(null, {
        status: 200,
        headers: {
            'set-cookie': cookie.serialize('session', '', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 0
            })
        }
    });
}