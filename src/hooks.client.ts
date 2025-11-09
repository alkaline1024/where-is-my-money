// Client-side hooks for SvelteKit
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
	console.error('Client error:', error, event);
};
