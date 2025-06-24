<script>
	const { userProfile } = $props();
	import RegisterProfile from './RegisterProfile.svelte';
</script>

{#if userProfile}
	<div>
		<pre>{JSON.stringify(userProfile, null, 4)}</pre>
	</div>
{:else}
	<RegisterProfile />
{/if}
