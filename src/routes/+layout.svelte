<!-- layout.svelte -->
<script lang="ts">
	import '../app.css';
	const { children, data } = $props();

	import { userStore } from '$lib/stores/user';
	$userStore = data.user!;
</script>

<svelte:head>
	<title>Hirehero</title>
	<meta
		name="description"
		content="End to end job application portal. User can find a variety of jobs and apply to them instantly. Employers can manage jobs, applications, etc with a dedicated dashboard"
	/>

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Hirehero - Job Application Platform" />
	<meta
		property="og:description"
		content="End to end job application portal. User can find a variety of jobs and apply to them instantly. Employers can manage jobs, applications, etc with a dedicated dashboard"
	/>
	<meta property="og:url" content="https://hirehero.tejasmore.in" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

{@render children()}
