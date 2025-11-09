import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'light';
	const saved = localStorage.getItem('theme') as Theme | null;
	if (saved) return saved;
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

export const theme = writable<Theme>(getInitialTheme());

export function applyTheme(t: Theme) {
	if (!browser) return;
	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	root.classList.add(t);
	localStorage.setItem('theme', t);
}

theme.subscribe(applyTheme);
