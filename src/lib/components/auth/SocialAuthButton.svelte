<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import type { Snippet } from 'svelte';

	let {
		children,
		provider,
		callbackURL = '/jobs'
	}: {
		children: Snippet;
		provider: 'google';
		callbackURL?: string;
	} = $props();
</script>

<button
	class="flex w-full cursor-pointer items-center justify-center gap-4 rounded-[8px] border border-[#DDDDDD] bg-[#EEEEEE] p-2 delay-75 hover:bg-[#DDDDDD]"
	onclick={async () => {
		await signIn.social({
			provider,
			callbackURL
		});
	}}
>
	<img src="/logos/google.png" alt={`${provider} logo`} class="h-4 w-4" />
	{@render children()}
</button>
