<script lang="ts">
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';

	export type Option = {
		value: string;
		label: string;
		icon?: any;
		class?: string;
	};

	let {
		name,
		options = [],
		multiple = false,
		creatable = false,
		value = $bindable(),
		onCreateOption,
		onSearchChange,
		label,
		placeholder = 'เลือก...',
		noDataText = 'ไม่พบรายการ',
		class: className
	}: {
		name?: string;
		options?: Option[];
		multiple?: boolean;
		creatable?: boolean;
		value?: string | string[] | null;
		onCreateOption?: (input: string) => Promise<Option> | Option;
		onSearchChange?: (query: string) => void | Promise<void>;
		label?: string;
		placeholder?: string;
		noDataText?: string;
		class?: string;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let highlight = $state(0);
	let inputEl: HTMLInputElement;
	let wrapperEl: HTMLDivElement;

	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		if (!onSearchChange) return;
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			onSearchChange?.(query);
		}, 200);
		return () => {
			if (debounceTimeout) clearTimeout(debounceTimeout);
		};
	});

	const selected = $derived.by(() => {
		if (multiple) {
			const arr = Array.isArray(value) ? value : [];
			return options.filter((o) => arr.includes(o.value));
		} else {
			const v = typeof value === 'string' ? value : null;
			return v ? options.filter((o) => o.value === v) : [];
		}
	});

	function setSelected(list: Option[]) {
		value = multiple ? list.map((o) => o.value) : (list[0]?.value ?? null);
		if (!multiple) open = false;
	}

	function addSelect(opt: Option) {
		if (multiple) {
			const arr = selected.map((o) => o.value);
			if (!arr.includes(opt.value)) setSelected([...selected, opt]);
		} else setSelected([opt]);
		query = '';
	}

	function removeAt(i: number) {
		if (!multiple) return;
		const cur = selected.slice();
		cur.splice(i, 1);
		setSelected(cur);
	}

	const filtered = $derived.by(() =>
		options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
	);

	const showCreatable = $derived.by(
		() =>
			creatable &&
			query.trim().length > 0 &&
			!options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase())
	);

	async function handleCreate() {
		if (!onCreateOption) return;
		const input = query.trim();
		if (!input) return;

		let newOption = await onCreateOption(input);
		if (newOption) {
			options = [...options, newOption];
			addSelect(newOption);
		}
	}

	function moveHighlight(d: number) {
		const total = filtered.length + (showCreatable ? 1 : 0);
		if (total === 0) return;
		highlight = (highlight + d + total) % total;
	}

	function commitHighlighted() {
		const isCreate = showCreatable && highlight === filtered.length;
		if (isCreate) handleCreate();
		else {
			const opt = filtered[highlight];
			if (opt) addSelect(opt);
		}
	}

	function isSelected(opt: Option) {
		return selected.some((o) => o.value === opt.value);
	}

	$effect(() => {
		const clickOutside = (e: MouseEvent) => {
			if (!wrapperEl?.contains(e.target as Node)) open = false;
		};
		document.addEventListener('click', clickOutside);
		return () => document.removeEventListener('click', clickOutside);
	});

	$effect(() => {
		if (open) query = '';
		else if (typeof value === 'string') query = value;
	});
</script>

<!-- UI -->
<div class="relative w-full" bind:this={wrapperEl}>
	{#if label}
		<label for={name} class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
	{/if}
	<div
		class="input w-full"
		onclick={() => {
			open = true;
			inputEl?.focus();
		}}
	>
		{#if multiple && selected.length}
			{#each selected as s, i}
				<span class="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-sm">
					{s.label}
					<button
						class="ml-1 rounded p-0.5 hover:bg-gray-200"
						onclick={(e) => {
							e.stopPropagation();
							removeAt(i);
						}}
					>
						✕
					</button>
				</span>
			{/each}
		{/if}

		<input
			class={clsx(
				'flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400',
				className
			)}
			placeholder={selected.length === 0 ? placeholder : ''}
			onfocus={() => {
				open = true;
				query = '';
			}}
			onchange={(e) => {
				query = (e.target as HTMLInputElement).value;
			}}
			onkeydown={(e) => {
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					moveHighlight(1);
					open = true;
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					moveHighlight(-1);
					open = true;
				} else if (e.key === 'Enter') {
					e.preventDefault();
					commitHighlighted();
				} else if (e.key === 'Escape') {
					open = false;
				}
			}}
			bind:value={query}
			bind:this={inputEl}
		/>

		{#if multiple ? selected.length > 0 : value}
			<button
				class="ml-1 rounded p-1 text-gray-500 hover:bg-gray-100"
				onclick={(e) => {
					e.stopPropagation();
					setSelected([]);
				}}
			>
				⟲
			</button>
		{/if}
		<span class="ml-1 text-gray-500">▾</span>
	</div>

	{#if open}
		<ul
			class="absolute z-[9999] mt-1 max-h-72 w-full overflow-auto rounded border border-gray-200 bg-white p-1 shadow-lg"
		>
			{#if filtered.length === 0 && !showCreatable}
				<li class="px-3 py-2 text-sm text-gray-500">{noDataText}</li>
			{/if}

			{#each filtered as opt, idx}
				<li
					class={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${opt.class ?? ''} ${highlight === idx ? 'bg-gray-100' : ''}`}
					onmouseenter={() => (highlight = idx)}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => addSelect(opt)}
				>
					{#if opt.icon}
						{#if typeof opt.icon === 'string'}
							<Icon icon={opt.icon} class="h-4 w-4" />
						{:else}
							<svelte:component this={opt.icon} class="h-4 w-4" />
						{/if}
					{/if}
					<span class="flex-1">{opt.label}</span>
					{#if isSelected(opt)}
						<span>✓</span>
					{/if}
				</li>
			{/each}

			{#if showCreatable}
				<li
					class={`mt-1 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 ${highlight === filtered.length ? 'bg-gray-100' : ''}`}
					onmouseenter={() => (highlight = filtered.length)}
					onmousedown={(e) => e.preventDefault()}
					onclick={handleCreate}
				>
					<span class="inline-flex h-4 w-4 items-center justify-center rounded border">＋</span>
					สร้าง “{query}”
				</li>
			{/if}
		</ul>
	{/if}
</div>
