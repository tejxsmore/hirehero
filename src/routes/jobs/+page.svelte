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
	<h1>Found {jobs.length} jobs</h1>
</div>
