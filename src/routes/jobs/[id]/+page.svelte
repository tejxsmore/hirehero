<script lang="ts">
	const { data } = $props();
	const { job } = data;

	import { ArrowUpRight } from '@lucide/svelte';

	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
</script>

<div class="flex w-full justify-center space-y-10 border-b border-[#272829] p-5 sm:py-20">
	<div class="max-w-2xl space-y-10">
		<h1 class="text-center text-3xl font-bold sm:text-5xl">{job.title}</h1>
		<div class="mt-4 flex flex-wrap justify-center gap-5">
			<p>
				<span class="text-[#6c757d]">Experience: </span>
				<span class="font-medium">{job.experienceLevel}</span>
			</p>
			<p>
				<span class="text-[#6c757d]">Type: </span>
				<span class="font-medium">{job.type}</span>
			</p>
			<p>
				<span class="text-[#6c757d]">Location: </span>
				<span class="font-medium">{job.locationType}</span>
			</p>
		</div>

		<data class="flex justify-center">
			{#if job.skills && job.skills.length > 0}
				<div class="mt-4 flex flex-wrap gap-2.5">
					{#each job.skills as skill}
						<p
							class="rounded-[10px] bg-[#272829] p-1 px-2.5
						text-white"
						>
							{skill}
						</p>
					{/each}
				</div>
			{/if}
		</data>

		<div class="flex justify-center">
			<button
				class="flex cursor-pointer items-center gap-2.5 rounded-full border border-[#14C38E] bg-[#00FFAB] px-7.5 py-2.5 text-[#0f0f0f] transition-colors duration-200 hover:bg-[#15F5BA]"
				>Apply <span><ArrowUpRight size="16" /></span></button
			>
		</div>
	</div>
</div>

<div class="flex justify-center p-5 sm:py-20">
	<p class="w-full max-w-3xl">
		<MarkdownParser content={job.description} />
	</p>
</div>
