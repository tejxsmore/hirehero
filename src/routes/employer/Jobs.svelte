<script lang="ts">
	const { jobs } = $props();
	import { Users, MapPin, Clock, Eye, EllipsisVertical } from '@lucide/svelte';

	let openOptionsId: string | null = $state(null);

	function toggleOptions(id: string) {
		openOptionsId = openOptionsId === id ? null : id;
	}

	function closeOptions() {
		openOptionsId = null;
	}

	function handleClickOutside(event: MouseEvent) {
		if (openOptionsId && !(event.target as Element).closest('.options-container')) {
			closeOptions();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && openOptionsId) {
			closeOptions();
		}
	}

	// Event listeners using Svelte 5 syntax
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);

			return () => {
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});

	async function updateJobStatus(jobId: string, newStatus: 'draft' | 'published' | 'closed') {
		try {
			const response = await fetch(`/api/jobs/${jobId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			if (!response.ok) {
				throw new Error('Failed to update job status');
			}

			// Update the job status in the local jobs array
			const jobIndex = jobs.findIndex((job: any) => job.id === jobId);
			if (jobIndex !== -1) {
				jobs[jobIndex].jobStatus = newStatus;
			}

			closeOptions();
		} catch (error) {
			console.error('Error updating job status:', error);
			// You might want to show a toast notification here
		}
	}

	async function deleteJob(jobId: string) {
		if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/jobs/${jobId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete job');
			}

			// Remove the job from the local jobs array
			const jobIndex = jobs.findIndex((job: any) => job.id === jobId);
			if (jobIndex !== -1) {
				jobs.splice(jobIndex, 1);
			}

			closeOptions();
		} catch (error) {
			console.error('Error deleting job:', error);
			// You might want to show a toast notification here
		}
	}

	function timeAgo(isoDateStr: string): string {
		const now = new Date();
		const past = new Date(isoDateStr);
		const diffTime = now.getTime() - past.getTime();
		const dayMs = 1000 * 60 * 60 * 24;
		const daysAgo = Math.floor(diffTime / dayMs);

		if (daysAgo < 7) {
			return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
		} else if (daysAgo < 30) {
			const weeks = Math.floor(daysAgo / 7);
			return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
		} else {
			const months = Math.floor(daysAgo / 30);
			return `${months} month${months === 1 ? '' : 's'} ago`;
		}
	}
</script>

<div class="space-y-4.5">
	<h2 class="text-3xl font-bold">Jobs</h2>

	<div class="space-y-5 overflow-y-auto">
		{#if jobs[0]}
			{#each jobs as job}
				<div
					class="space-y-5 rounded-[15px] border border-gray-300
				bg-white p-5"
				>
					<div class="flex items-center justify-between">
						<a href={`/jobs/${job.id}`} class="text-lg font-semibold">
							{job.title}
						</a>

						<div class="options-container relative flex items-center gap-2.5">
							<p
								class="rounded-[5px] px-3 py-1
								text-sm
								{job.jobStatus === 'draft'
									? 'bg-yellow-50 text-yellow-600'
									: job.jobStatus === 'published'
										? 'bg-blue-50 text-blue-600'
										: 'bg-gray-100 text-gray-600'}
								"
							>
								{job.jobStatus === 'draft'
									? 'Draft'
									: job.jobStatus === 'published'
										? 'Published'
										: 'Closed'}
							</p>
							<button
								class="cursor-pointer rounded-[5px] bg-gray-100 p-1 py-2 focus:outline-none"
								onclick={() => toggleOptions(job.id)}
							>
								<EllipsisVertical size="16" class="text-gray-600" />
							</button>

							{#if openOptionsId === job.id}
								<div
									class="absolute top-10 right-0 z-10 w-40 space-y-1 rounded-[15px] border border-gray-300 bg-white p-1 shadow-lg"
								>
									{#if job.jobStatus !== 'draft'}
										<button
											class="block w-full cursor-pointer rounded-[10px] px-3 py-1.5 text-left text-sm hover:bg-gray-100"
											onclick={() => updateJobStatus(job.id, 'draft')}
										>
											Mark as Draft
										</button>
									{/if}

									{#if job.jobStatus !== 'published'}
										<button
											class="cusrsor-pointer block w-full rounded-[10px] px-3 py-1.5 text-left text-sm hover:bg-gray-100"
											onclick={() => updateJobStatus(job.id, 'published')}
										>
											Publish
										</button>
									{/if}

									{#if job.jobStatus !== 'closed'}
										<button
											class="block w-full cursor-pointer rounded-[10px] px-3 py-1.5 text-left text-sm hover:bg-gray-100"
											onclick={() => updateJobStatus(job.id, 'closed')}
										>
											Close Job
										</button>
									{/if}

									<button
										class="block w-full cursor-pointer rounded-[10px] px-3 py-1.5 text-left text-sm text-red-400 hover:bg-red-100"
										onclick={() => deleteJob(job.id)}
									>
										Delete
									</button>
								</div>
							{/if}
						</div>
					</div>

					{#if job.skills}
						<div class="flex flex-wrap gap-2.5 text-sm">
							{#each job.skills as skill}
								<p class="rounded-[5px] bg-gray-100 px-2.5 py-1">{skill}</p>
							{/each}
						</div>
					{/if}

					<div class="flex flex-wrap gap-5 text-sm text-gray-600">
						<div class="flex items-center gap-2.5">
							<MapPin size="14" />
							{#if job.city}
								{`${job.city}, ${job.country} (${job.locationType})`}
							{:else}
								{job.locationType}
							{/if}
						</div>
						<div class="flex items-center gap-2.5">
							<Clock size="14" />
							<span>{job.type}</span>
						</div>
					</div>

					<div class="flex items-center gap-5 text-sm text-gray-400">
						<p class="flex items-center gap-2.5">
							<Users size="14" class="" />
							<span class="flex gap-1.5">0 <span class="hidden sm:block">applicants</span></span>
						</p>
						<p class="flex items-center gap-2.5">
							<Eye size="14" />
							<span class="flex gap-1.5">0 <span class="hidden sm:block">views</span></span>
						</p>
						<p>Posted {timeAgo(job.createdAt)}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
