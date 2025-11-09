import type { RequestEvent } from "@sveltejs/kit";

export const getUserId = (request: RequestEvent) => {
	const userId = request.locals.session?.user?.id;
	if (!userId) {
		throw new Error('User ID not found in session');
	}
	return userId;
};
