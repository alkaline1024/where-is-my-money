<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - Where is my money</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
		<p class="mt-2 text-gray-600 dark:text-gray-400">ภาพรวมการเงินของคุณ</p>
	</div>

	{#if data.session?.user}
		<div class="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">ข้อมูลผู้ใช้</h2>
			<div class="mt-4 space-y-2">
				<p class="text-gray-600 dark:text-gray-400">
					<span class="font-medium">ชื่อ:</span>
					{data.session.user.name || 'ไม่ระบุ'}
				</p>
				<p class="text-gray-600 dark:text-gray-400">
					<span class="font-medium">อีเมล:</span>
					{data.session.user.email || 'ไม่ระบุ'}
				</p>
				<p class="text-gray-600 dark:text-gray-400">
					<span class="font-medium">User ID:</span>
					{data.session.user.id || 'ไม่ระบุ'}
				</p>
			</div>
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<!-- ยอดคงเหลือ -->
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">ยอดคงเหลือ</h3>
				<p class="mt-2 text-3xl font-bold text-green-600">฿0.00</p>
				<p class="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
			</div>

			<!-- รายรับ -->
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">รายรับรวม</h3>
				<p class="mt-2 text-3xl font-bold text-blue-600">฿0.00</p>
				<p class="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
			</div>

			<!-- รายจ่าย -->
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">รายจ่ายรวม</h3>
				<p class="mt-2 text-3xl font-bold text-red-600">฿0.00</p>
				<p class="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
			</div>
		</div>

		<div class="mt-8 grid gap-6 lg:grid-cols-2">
			<!-- รายการล่าสุด -->
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">รายการล่าสุด</h3>
				<div class="mt-4">
					<p class="text-gray-500">ยังไม่มีรายการ</p>
					<a href="/transactions" class="mt-2 inline-block text-blue-600 hover:text-blue-800">
						เพิ่มรายการแรก →
					</a>
				</div>
			</div>

			<!-- หมวดหมู่ -->
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">หมวดหมู่</h3>
				<div class="mt-4">
					<p class="text-gray-500">ยังไม่มีหมวดหมู่</p>
					<a href="/categories" class="mt-2 inline-block text-blue-600 hover:text-blue-800">
						สร้างหมวดหมู่แรก →
					</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="text-center">
			<p class="text-gray-600 dark:text-gray-400">กรุณาเข้าสู่ระบบก่อน</p>
		</div>
	{/if}
</div>
