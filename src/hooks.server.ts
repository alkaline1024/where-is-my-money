import { handle as authHandle } from './auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authorizationHandle: Handle = async ({ event, resolve }) => {
	// add session for svelte locals
	event.locals.session = await event.locals.auth();

	// required login for protected routes
	const protectedRoutes = ['/dashboard', '/transactions', '/categories', '/profile'];
	const isProtectedRoute = protectedRoutes.some((route) => event.url.pathname.startsWith(route));

	if (isProtectedRoute && !event.locals.session?.user) {
		throw redirect(302, '/auth/signin');
	}

	return resolve(event);
};

export const handle = sequence(authHandle, authorizationHandle);
