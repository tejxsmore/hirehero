<script lang="ts">
	import { goto } from '$app/navigation';

	const { data } = $props();
	const { jobs } = data;

	import { userStore } from '$lib/stores/user.js';
	if (!$userStore) {
		goto('/sign-in');
	}
</script>

<div class="flex min-h-screen bg-black p-5">
	<div class="w-full space-y-4 overflow-y-auto md:w-2/5">
		{#each jobs as job}
			<a
				href="/jobs/{job.id}"
				class="flex cursor-pointer items-center justify-between rounded-[15px] border border-[#272829] bg-[#0f0f0f] p-5 shadow"
			>
				<h2 class="text-lg font-semibold">{job.title}</h2>
			</a>
		{/each}
	</div>
</div>
