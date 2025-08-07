<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	const { children, data } = $props();

	import { userStore } from '$lib/stores/user';
	$userStore = data.user!;
</script>

<svelte:head>
	<title>Hirehero</title>
</svelte:head>

{@render children()}
