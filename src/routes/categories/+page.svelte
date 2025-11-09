<script lang="ts">
	import { onMount } from 'svelte';
	import type { Category } from '$lib/models/categories';
	import Input from '$lib/components/Forms/Input.svelte';
	import Table from '$lib/components/Table/Table.svelte';
	import { categoryFormSchema } from '../../forms/category.form';
	import { validateForm } from '../../utils/forms';
	import { showErrorToast, showSuccessToast } from '../../utils/toasts';

	let isLoading = $state(true);
	let categories: Category[] = $state([]);
	let form = $state({
		name: '',
		color: '',
		icon: ''
	});

	const fetchCategories = async () => {
		isLoading = true;
		try {
			const response = await fetch('/api/categories');
			const result: { data: Category[] } = await response.json();
			categories = result.data;
		} catch (error) {
			console.error('Error fetching categories:', error);
		} finally {
			isLoading = false;
		}
	};

	const handleSubmitCreateForm = async (event: Event) => {
		event.preventDefault();
		const errors = validateForm(form, categoryFormSchema);
		if (errors) {
			return;
		}
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(form)
			});
			if (response.ok) {
				closeCategoryFormModal();
				showSuccessToast('สร้างหมวดหมู่สำเร็จ');
				await fetchCategories();
				form.name = '';
				form.color = '';
			} else {
				console.error('Error creating category:', response.statusText);
			}
		} catch (error) {
			console.error('Error creating category:', error);
		}
	};

	const openCategoryFormModal = () => {
		const modal = document.getElementById('category-form-modal') as HTMLDialogElement;
		modal.setAttribute('open', 'true');
	};

	const closeCategoryFormModal = () => {
		const modal = document.getElementById('category-form-modal') as HTMLDialogElement;
		modal.removeAttribute('open');
	};

	onMount(() => {
		fetchCategories();
	});
</script>

<div class="space-y-4 p-4">
	<div class="flex items-center justify-between">
		<div class="flex gap-4"><Input /></div>
		<button
			type="button"
			class="btn btn-primary"
			onclick={() => {
				form.name = '';
				form.color = '';
				form.icon = '';
				openCategoryFormModal();
			}}>สร้าง</button
		>
		<dialog class="modal" id="category-form-modal">
			<div class="modal-box">
				<form onsubmit={handleSubmitCreateForm}>
					<h3 class="text-lg font-bold">สร้างหมวดหมู่ใหม่</h3>
					<div class="space-y-2 py-4">
						<Input label="ชื่อ" placeholder="ชื่อหมวดหมู่" class="w-full" bind:value={form.name} />
						<Input label="สี" placeholder="สีหมวดหมู่" class="w-full" bind:value={form.color} />
						<Input label="ไอคอน" placeholder="ไอคอนแสดง" class="w-full" bind:value={form.icon} />
					</div>
					<div class="modal-action">
						<button class="btn mb-2 btn-primary">บันทึก</button>
						<button type="button" class="btn" onclick={closeCategoryFormModal}>ยกเลิก</button>
					</div>
				</form>
			</div>
		</dialog>
	</div>
	<Table
		data={categories}
		loading={isLoading}
		columns={[
			{
				header: 'ID',
				accessorKey: 'id'
			},
			{
				header: 'Color',
				accessorKey: 'color'
			},
			{
				header: 'Name',
				accessorKey: 'name'
			},
			{
				header: 'Created Date',
				accessorKey: 'created_date'
			},
			{
				header: 'Updated Date',
				accessorKey: 'updated_date'
			},
			{
				header: 'Actions',
				type: 'actions',
				actions: [
					{
						type: 'edit',
						label: 'แก้ไข',
						onClick: (row) => {
							form.name = row.name;
							form.color = row.color;
							form.icon = row.icon;
							openCategoryFormModal();
						}
					},
					{
						type: 'delete',
						label: 'ลบ',
						onClick: (row) => {
							try {
								fetch(`/api/categories/${row.id}`, {
									method: 'DELETE'
								}).then(async (response) => {
									if (response.ok) {
										showSuccessToast('ลบหมวดหมู่สำเร็จ');
										await fetchCategories();
									} else {
										console.error('Error deleting category:', response.statusText);
									}
								});
							} catch (error) {
								showErrorToast('เกิดข้อผิดพลาดในการลบหมวดหมู่');
								console.error('Error deleting category:', error);
							}
						}
					}
				]
			}
		]}
	/>
</div>
