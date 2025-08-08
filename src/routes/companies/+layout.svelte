<script lang="ts">
	const { children, data } = $props();

	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<Navbar />
{@render children()}
<Footer />
