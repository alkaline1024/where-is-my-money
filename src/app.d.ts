// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('@auth/sveltekit').AuthKitInstance;
			session: import('@auth/sveltekit').Session | null;
		}
		interface PageData {
			session: import('@auth/sveltekit').Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
