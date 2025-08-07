<script lang="ts">
	const { applications } = $props();

	function capitalize(str: string) {
		if (typeof str !== 'string') return '';
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
</script>

<div class="space-y-4.5">
	{#each applications as { application, user, job, profile }}
		<div
			class="space-y-3 rounded-[15px] border border-[#EAE9E9] bg-white
        p-4.5"
		>
			<div class="flex items-start justify-between">
				<h3>{profile.fullName}</h3>
				<p class="rounded-[6px] bg-[#EAE9E9] px-1.5 py-0.5 text-xs">
					{capitalize(application.status)}
				</p>
			</div>
			<h1 class="text-sm text-[#57564F]">{profile.headline}</h1>
		</div>
	{/each}
</div>
