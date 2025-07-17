<script lang="ts">
	const { children, data } = $props();

	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Navbar />
{@render children()}
