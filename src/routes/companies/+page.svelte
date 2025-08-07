<script lang="ts">
	const { data } = $props();
	const { companies } = data;
</script>

<div class="min-h-screen p-4.5 lg:px-20 xl:px-40">
	<div class="grid gap-4.5 sm:grid-cols-3">
		{#each companies as { companyName, companyLocation }}
			<div
				class="h-full space-y-3 rounded-[15px] border
			border-[#EAE9E9] bg-white p-4.5"
			>
				<h1 class="text-xl font-semibold">{companyName}</h1>
				<h2 class="text-sm font-medium tracking-wide text-[#57564F]">{companyLocation}</h2>
			</div>
		{/each}
	</div>
</div>
