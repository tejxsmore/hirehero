<script lang="ts">
	const { data } = $props();
	const { companies } = data;
</script>

<div class="min-h-screen bg-black p-5">
	<div class="grid gap-5 sm:grid-cols-3">
		{#each companies as { companyName, companyLocation }}
			<div class="h-full rounded-[15px] border border-[#272829] bg-[#0f0f0f] p-5">
				<h1>{companyName}</h1>
				<h2>{companyLocation}</h2>
			</div>
		{/each}
	</div>
</div>
