<script lang="ts">
	import clsx from 'clsx';
	import Icon from '@iconify/svelte';

	const { class: className = '', ...props } = $props();
</script>

<Icon icon="svg-spinners:bars-rotate-fade" class={clsx('size-8', className)} {...props} />
