<script lang="ts">
	import clsx from 'clsx';

	let { value = $bindable(), ...props }: {
		name?: string;
		label?: string;
		placeholder?: string;
		class?: string;
		value?: string;
	} = $props();
</script>

<div>
	{#if props.label}
		<label for={props.name} class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{props.label}
		</label>
	{/if}
	<input
		id={props.name}
		name={props.name}
		type="text"
		class={clsx('input-bordered input', props.class)}
		placeholder={props.placeholder}
		bind:value
	/>
</div>
