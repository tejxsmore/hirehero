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
	class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[12px]
	border border-[#D4D7DD] bg-[#EAE9E9] px-4.5 py-1.5 transition-colors duration-300 hover:bg-[#D4D7DD]"
	onclick={async () => {
		await signIn.social({
			provider,
			callbackURL
		});
	}}
>
	<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 32 32"
		><path
			d="M29.44,16.318c0-.993-.089-1.947-.255-2.864h-13.185v5.422h7.535c-.331,1.744-1.324,3.22-2.813,4.213v3.525h4.544c2.647-2.444,4.175-6.033,4.175-10.296Z"
			opacity=".4"
		></path><path
			d="M16,30c3.78,0,6.949-1.247,9.265-3.385l-4.544-3.525c-1.247,.84-2.838,1.349-4.722,1.349-3.64,0-6.733-2.456-7.84-5.765l-2.717,2.09-1.941,1.525c2.304,4.569,7.025,7.713,12.498,7.713Z"
		></path><path
			d="M8.16,18.66c-.28-.84-.445-1.731-.445-2.66s.165-1.82,.445-2.66v-3.615H3.502c-.955,1.884-1.502,4.009-1.502,6.275s.547,4.391,1.502,6.275h3.332s1.327-3.615,1.327-3.615Z"
			opacity=".4"
		></path><path
			d="M16,7.575c2.062,0,3.895,.713,5.358,2.087l4.009-4.009c-2.431-2.265-5.587-3.653-9.367-3.653-5.473,0-10.195,3.144-12.498,7.725l4.658,3.615c1.107-3.309,4.2-5.765,7.84-5.765Z"
		></path></svg
	>
	{@render children()}
</button>
