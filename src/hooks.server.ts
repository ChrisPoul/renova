import type { Handle } from '@sveltejs/kit';
import cookie from 'cookie';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const session = cookies.session;

	// Allow access to login and static assets
	if (
		event.url.pathname.startsWith('/login') ||
		event.url.pathname.startsWith('/api/login') ||
		event.url.pathname.startsWith('/favicon') ||
		event.url.pathname.startsWith('/_app')
	) {
		return resolve(event);
	}

	// If not logged in, redirect to login
	if (session !== 'valid') {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
