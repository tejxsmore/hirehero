<script lang="ts">
	const { data } = $props();
	const { job } = data;

	import { ArrowUpRight } from '@lucide/svelte';

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
</script>

<div class="flex w-full justify-center space-y-10 border-b border-gray-300 p-5 sm:py-20">
	<div class="max-w-2xl space-y-10">
		<h1 class="text-center text-3xl font-bold sm:text-5xl">{job.title}</h1>
		<div class="mt-4 flex flex-wrap justify-center gap-5">
			<p>
				<span class="text-gray-600">Experience: </span>
				<span class="font-medium">{job.experienceLevel}</span>
			</p>
			<p>
				<span class="text-gray-600">Type: </span>
				<span class="font-medium">{job.type}</span>
			</p>
			<p>
				<span class="text-gray-600">Location: </span>
				<span class="font-medium">{job.locationType}</span>
			</p>
		</div>

		<data class="flex justify-center">
			{#if job.skills && job.skills.length > 0}
				<div class="mt-4 flex flex-wrap gap-2.5">
					{#each job.skills as skill}
						<p class="rounded-[5px] bg-gray-200 p-1 px-2.5">
							{skill}
						</p>
					{/each}
				</div>
			{/if}
		</data>

		<div class="flex justify-center">
			<button
				class="flex cursor-pointer items-center gap-2.5 rounded-full border border-[#E6521F] bg-[#FF4F0F] px-7.5 py-2.5 text-white transition-colors duration-300 hover:bg-[#F14A00]"
				>Apply <span><ArrowUpRight size="16" /></span></button
			>
		</div>
	</div>
</div>

<div class="flex justify-center bg-white p-5 sm:py-20">
	<p class="w-full max-w-3xl">
		<MarkdownParser content={job.description} />
	</p>
</div>
