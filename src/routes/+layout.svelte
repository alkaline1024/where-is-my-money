<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { theme, type Theme } from '$lib/stores/theme';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';

	let { children, data }: { children: any; data: LayoutData } = $props();

	function toggleTheme() {
		let next: Theme;
		$theme === 'dark' ? (next = 'light') : (next = 'dark');
		theme.set(next);
	}

	function handleSignIn() {
		signIn('cognito', {
			callbackUrl: '/dashboard'
		});
	}

	function handleSignOut() {
		signOut();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex items-center gap-4 border-b border-gray-200 p-4 dark:border-gray-800">
	<h1 class="text-xl font-semibold">Where is my money</h1>
	<div class="ml-auto flex items-center gap-3">
		{#if data.session?.user}
			<!-- User logged in -->
			<span class="text-sm text-gray-600 dark:text-gray-400">
				สวัสดี, {data.session.user.name || data.session.user.email}
			</span>
			<nav class="flex items-center gap-2">
				<a
					href="/dashboard"
					class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
				>
					Dashboard
				</a>
				<a
					href="/transactions"
					class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
				>
					Transactions
				</a>
				<a
					href="/categories"
					class="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
				>
					Categories
				</a>
			</nav>
			<button
				onclick={handleSignOut}
				class="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900 dark:text-red-300"
			>
				ออกจากระบบ
			</button>
		{:else}
			<!-- User not logged in -->
			<button
				onclick={handleSignIn}
				class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
			>
				เข้าสู่ระบบ
			</button>
		{/if}
		<button
			onclick={toggleTheme}
			class="inline-flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
		>
			<span>สลับธีม</span>
			<span class="text-xs uppercase">{$theme}</span>
		</button>
	</div>
</header>

{@render children?.()}
