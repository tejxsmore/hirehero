<script lang="ts">
	const { data } = $props();
	const { jobs } = data;

	import { Briefcase, MapPin } from '@lucide/svelte';
</script>

<div class="min-h-screen p-5">
	<div class="flex w-full flex-col items-center justify-center space-y-10 py-20">
		<h1>Find you dream jobs</h1>
		<div
			class="flex w-full gap-2.5 rounded-[15px] border border-gray-300 bg-gray-200 p-1 px-5 sm:max-w-2xl"
		>
			<div class="flex w-full items-center gap-2.5">
				<Briefcase size="16" class="text-gray-400" />
				<input
					type="text"
					name="title"
					placeholder="SEO intern"
					class="w-30 p-2.5 placeholder:text-gray-400 focus:outline-none sm:w-full"
				/>
			</div>
			<div class="flex w-full items-center gap-2.5">
				<MapPin size="16" class="text-gray-400" />
				<input
					type="text"
					name="location"
					placeholder="Mumbai"
					class="w-30 p-2.5 pr-0 placeholder:text-gray-400 focus:outline-none sm:w-full"
				/>
			</div>
		</div>
		<div class="flex flex-wrap"></div>
	</div>

	<div class="space-y-5">
		{#each jobs as job}
			<a
				href={`/jobs/${job.id}`}
				class="flex cursor-pointer flex-col rounded-[15px] border border-gray-300 bg-white p-5"
			>
				<h1 class="text-lg font-semibold">{job.title}</h1>
				<p>{job.employer.name}</p>
			</a>
		{/each}
	</div>
</div>
