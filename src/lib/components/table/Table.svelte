<script lang="ts" generics="T extends Record<string, any> = Record<string, any>">
	import Icon from '@iconify/svelte';
	import clsx from 'clsx';

	type Column = {
		type?: 'date' | 'datetime' | 'icon';
		header: string;
		accessorKey?: keyof T;
		cell?: (row: T) => any;
	};
	type ColumnAction = {
		type: 'actions';
		header: string;
		actions: Array<{
			type?: 'delete' | 'edit';
			icon?: string;
			label: string;
			onClick: (row: T) => void;
		}>;
	};

	let {
		data = [],
		columns = [],
		loading = false
	}: {
		data: T[];
		columns: Array<Column | ColumnAction>;
		loading?: boolean;
	} = $props();

	const renderCell = (row: T, column: Column) => {
		if (column.cell) {
			return column.cell(row);
		} else if (!column.accessorKey) {
			return '';
		} else if (column.type === 'date') {
			const date = new Date(String(row[column.accessorKey]));
			return date.toLocaleDateString();
		} else if (column.type === 'datetime') {
			const date = new Date(String(row[column.accessorKey]));
			return date.toLocaleString();
		}
		return row[column.accessorKey];
	};
</script>

<table class="table w-full">
	<thead>
		<tr>
			{#each columns as column}
				<th
					class="border-b border-gray-200 p-4 text-left text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-white"
				>
					{column.header}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#if loading}
			<tr>
				<td
					class="border-b border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300"
					colspan={columns.length}
				>
					กำลังโหลด...
				</td>
			</tr>
		{:else}
			{#each data as row}
				<tr>
					{#each columns as column}
						<td
							class="border-b border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300"
						>
							{#if column.type === 'actions'}
								{#each column.actions as action}
									{@const icon = action.icon
										? action.icon
										: action.type === 'delete'
											? 'mdi:delete'
											: action.type === 'edit'
												? 'mdi:pencil'
												: null}
									<button
										class={clsx('btn mr-2 btn-sm', {
											'text-white btn-error': action.type === 'delete',
											'btn-primary': action.type === 'edit'
										})}
										onclick={() => action.onClick(row)}
									>
										{#if icon}
											<Icon {icon}></Icon>
										{/if}
										{action.label}
									</button>
								{/each}
							{:else if column.type === 'icon'}
								<Icon icon={String(renderCell(row, column))} class="text-2xl"></Icon>
							{:else}
								{renderCell(row, column) || '-'}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		{/if}
	</tbody>
</table>
