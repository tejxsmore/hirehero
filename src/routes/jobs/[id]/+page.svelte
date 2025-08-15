<script lang="ts">
	const { data } = $props();
	const { job } = data;
	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
</script>

<div class="flex w-full justify-center border-b border-gray-300 p-5 py-10 sm:py-20">
	<div class="max-w-2xl space-y-9">
		<h1 class="text-center text-3xl font-bold sm:text-5xl">{job.title}</h1>

		<div class="flex flex-wrap justify-center space-y-3 space-x-6">
			<p>
				<span class="text-[#7A7A73]">Experience: </span>
				<span class="font-medium">{job.experienceLevel}</span>
			</p>
			<p>
				<span class="text-[#7A7A73]">Type: </span>
				<span class="font-medium">{job.type}</span>
			</p>
			<p>
				<span class="text-[#7A7A73]">Location: </span>
				<span class="font-medium">{job.locationType}</span>
			</p>
		</div>

		{#if job.skills && job.skills.length > 0}
			<div class="flex flex-wrap justify-center gap-3">
				{#each job.skills as skill}
					<span class="rounded-[9px] bg-[#EAE9E9] px-3 py-1 text-sm">{skill}</span>
				{/each}
			</div>
		{/if}

		<div class="flex justify-center">
			<button
				class="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
			>
				Apply Now
			</button>
		</div>
	</div>
</div>

<div class="flex justify-center bg-white p-4.5 sm:py-18">
	<div class="w-full max-w-3xl">
		<MarkdownParser content={job.description} />
	</div>
</div>
