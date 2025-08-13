<script lang="ts">
	const { children, data } = $props();

	import Navbar from '$lib/components/nav/Navbar.svelte';
	import Footer from '$lib/components/nav/Footer.svelte';
</script>

<Navbar />
{@render children()}
<Footer />
