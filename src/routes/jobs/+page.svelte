<script lang="ts">
	import { goto } from '$app/navigation';

	const { data } = $props();
	const { jobs } = data;

	import { userStore } from '$lib/stores/user.js';
	if (!$userStore) {
		goto('/sign-in');
	}
</script>

<div class="p-4">
	<div class="w-full space-y-4 overflow-y-auto md:w-2/5">
		{#each jobs as job}
			<div>
				<h1>{job.title}</h1>
			</div>
		{/each}
	</div>
</div>
