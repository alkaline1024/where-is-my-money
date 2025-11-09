<script lang="ts">
	import SelectCombobox, { type Option } from '$lib/components/forms/SelectCombobox.svelte';
	import { onMount } from 'svelte';

	const iconPrefix = 'mdi';
	let options: Option[] = $state([]);
	let {
		value = $bindable(),
		label,
		placeholder,
		class: className
	}: { value: string | null; label?: string; placeholder?: string; class?: string } = $props();

	onMount(async () => {
		const res = await fetch(`https://api.iconify.design/collection?prefix=${iconPrefix}`);
		const data = await res.json();
		const uncategorized = data.uncategorized as string[];
		options = uncategorized.map((icon) => ({
			value: `mdi:${icon}`,
			label: icon,
			// label: icon.replaceAll('-', ' '),
			icon: `${iconPrefix}:${icon}`
			// class: 'capitalize'
		}));
	});
</script>

<SelectCombobox {options} {label} {placeholder} class={className} bind:value />
