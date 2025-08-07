<script lang="ts">
	let { jobs } = $props();

	import { Users, MapPin, Clock, Eye, EllipsisVertical, Check } from '@lucide/svelte';

	let openOptionsId: string | null = $state(null);
	let showConfirmModal: boolean = $state(false);
	let currentAction: {
		type: 'status' | 'delete';
		jobId: string;
		newStatus?: 'draft' | 'published' | 'closed';
	} | null = $state(null);

	function toggleOptions(id: string) {
		openOptionsId = openOptionsId === id ? null : id;
	}

	function closeOptions() {
		openOptionsId = null;
	}

	function closeConfirmModal() {
		showConfirmModal = false;
		currentAction = null;
	}

	function handleClickOutside(event: MouseEvent) {
		// Close options dropdown if clicked outside
		if (openOptionsId && !(event.target as Element).closest('.options-container')) {
			closeOptions();
		}
		// Close confirmation modal if clicked outside
		if (showConfirmModal && !(event.target as Element).closest('.modal-content')) {
			closeConfirmModal();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (openOptionsId) {
				closeOptions();
			}
			if (showConfirmModal) {
				closeConfirmModal();
			}
		}
	}

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

	// Effect to control body scroll when modal is open
	$effect(() => {
		if (typeof document !== 'undefined') {
			if (showConfirmModal) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = ''; // Reset to default
			}
		}
	});

	function openConfirmModal(
		type: 'status' | 'delete',
		jobId: string,
		newStatus?: 'draft' | 'published' | 'closed'
	) {
		currentAction = { type, jobId, newStatus };
		showConfirmModal = true;
		closeOptions(); // Close the dropdown when modal opens
	}

	async function confirmAction() {
		if (!currentAction) return;

		const { type, jobId, newStatus } = currentAction;

		try {
			if (type === 'status' && newStatus) {
				const response = await fetch(`/api/jobs/updateStatus`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ jobId, status: newStatus })
				});
				if (!response.ok) {
					throw new Error('Failed to update job status');
				}
				// Update the job status in the local jobs array by reassigning it
				jobs = jobs.map((job: any) => (job.id === jobId ? { ...job, jobStatus: newStatus } : job));
			} else if (type === 'delete') {
				const response = await fetch(`/api/jobs/delete`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ jobId })
				});
				if (!response.ok) {
					throw new Error('Failed to delete job');
				}
				// Remove the job from the local jobs array by reassigning it
				jobs = jobs.filter((job: any) => job.id !== jobId);
			}
			closeConfirmModal();
		} catch (error) {
			console.error(`Error ${type}ing job:`, error);
			// You might want to show a toast notification here
			closeConfirmModal(); // Close modal even on error
		}
	}

	function timeAgo(isoDateStr: string): string {
		const now = new Date();
		const past = new Date(isoDateStr);
		const diffTime = now.getTime() - past.getTime();
		const dayMs = 1000 * 60 * 60 * 24;
		const daysAgo = Math.floor(diffTime / dayMs);

		if (daysAgo === 0) return 'Today';
		if (daysAgo === 1) return '1 day ago';
		if (daysAgo < 7) return `${daysAgo} days ago`;

		const weeks = Math.floor(daysAgo / 7);
		if (weeks === 1) return '1 week ago';
		if (weeks < 4) return `${weeks} weeks ago`;

		const months = Math.floor(daysAgo / 30);
		if (months === 1) return '1 month ago';
		return `${months} months ago`;
	}

	function getStatusTextClass(status: string | undefined) {
		// Only return font-semibold, no color for status text in modal
		if (status === 'draft' || status === 'published' || status === 'closed') {
			return 'font-semibold';
		}
		return '';
	}

	function formatStatusForDisplay(status: string | undefined) {
		if (!status) return '';
		return status.charAt(0).toUpperCase() + status.slice(1);
	}
</script>

<div class="w-full space-y-4.5">
	<div class="grid gap-4.5 xl:grid-cols-2">
		{#if jobs.length > 0}
			{#each jobs as job (job.id)}
				<div
					class="w-full cursor-pointer space-y-3 rounded-[15px] border border-[#EAE9E9] bg-white p-4.5"
				>
					<div class="flex items-start justify-between">
						<a href={`/jobs/${job.id}`} class="text-lg font-semibold">
							{job.title}
						</a>
						<div class="options-container relative flex items-center gap-3">
							<p
								class="rounded-[6px] border border-[#EAE9E9] px-2 py-0.5 text-xs"
								aria-label={`Job status: ${job.jobStatus}`}
							>
								{formatStatusForDisplay(job.jobStatus)}
							</p>
							<button
								onclick={() => toggleOptions(job.id)}
								aria-label="Job options"
								class="cursor-pointer text-[#57564F] hover:text-[#212121] focus:outline-none"
							>
								<EllipsisVertical size="18" />
							</button>
							{#if openOptionsId === job.id}
								<div
									class="absolute top-10 right-0 z-10 w-40 space-y-1 rounded-[12px] border border-[#D4D7DD] bg-[#EAE9E9] p-1"
									role="menu"
									aria-orientation="vertical"
								>
									<!-- Dropdown options with tick mark and new order -->
									<button
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {job.jobStatus ===
										'draft'
											? 'bg-[#DDDDDD]'
											: 'hover:bg-[#DDDDDD]'}"
										onclick={(e) => {
											e.stopPropagation();
											openConfirmModal('status', job.id, 'draft');
										}}
										role="menuitem"
									>
										<span>Draft</span>
										{#if job.jobStatus === 'draft'}
											<Check size="14" />
										{/if}
									</button>
									<button
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {job.jobStatus ===
										'published'
											? 'bg-[#DDDDDD] '
											: 'hover:bg-[#DDDDDD]'}"
										onclick={(e) => {
											e.stopPropagation();
											openConfirmModal('status', job.id, 'published');
										}}
										role="menuitem"
									>
										<span>Publish</span>
										{#if job.jobStatus === 'published'}
											<Check size="14" />
										{/if}
									</button>
									<button
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {job.jobStatus ===
										'closed'
											? 'bg-[#DDDDDD]'
											: 'hover:bg-[#DDDDDD]'}"
										onclick={(e) => {
											e.stopPropagation();
											openConfirmModal('status', job.id, 'closed');
										}}
										role="menuitem"
									>
										<span>Close Job</span>
										{#if job.jobStatus === 'closed'}
											<Check size="14" />
										{/if}
									</button>
									<button
										class="block w-full cursor-pointer rounded-[9px] px-3 py-1 text-left text-sm text-[#E52020] hover:bg-[#E52020] hover:text-white"
										onclick={(e) => {
											e.stopPropagation();
											openConfirmModal('delete', job.id);
										}}
										role="menuitem"
									>
										Delete
									</button>
								</div>
							{/if}
						</div>
					</div>
					{#if job.skills && job.skills.length > 0}
						<div class="flex flex-wrap items-center gap-3">
							{#each job.skills.slice(0, 3) as skill}
								<span class="rounded-[9px] bg-[#F6F6F6] px-3 py-1 text-sm">{skill}</span>
							{/each}
							{#if job.skills.length > 3}
								<span class="text-sm text-[#7A7A73]">+{job.skills.length - 3} more</span>
							{/if}
						</div>
					{/if}
					<div class="flex flex-wrap items-center gap-4.5 text-sm text-[#57564F]">
						<div class="flex items-center gap-3">
							<MapPin size="12" />
							<span class="">
								{#if job.city}
									{job.city}, {job.country || ''} ({job.locationType})
								{:else}
									{job.locationType}
								{/if}
							</span>
						</div>
						<div class="flex items-center gap-3">
							<Clock size="12" />
							<span>{job.type}</span>
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-4.5 text-sm text-[#7A7A73]">
						<p class="flex items-center gap-3">
							<Users size="12" />
							<span class="flex gap-1.5">0 <span class="hidden sm:block">applicants</span></span>
						</p>
						<p class="flex items-center gap-3">
							<Eye size="12" />
							<span class="flex gap-1.5">0<span class="hidden sm:block">views</span></span>
						</p>
						<p>Posted {timeAgo(job.createdAt)}</p>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-center text-gray-500">No jobs to display.</p>
		{/if}
	</div>
</div>

<!-- Confirmation Modal -->
{#if showConfirmModal}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4.5"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="modal-content w-full max-w-sm space-y-4 rounded-[15px] border border-[#EAE9E9] bg-white p-6 shadow-lg"
		>
			<h2 class="text-lg font-semibold">Confirm Action</h2>
			<p>
				{#if currentAction?.type === 'status'}
					Are you sure you want to change the status of this job to
					<span class={getStatusTextClass(currentAction.newStatus)}>
						{formatStatusForDisplay(currentAction.newStatus)}
					</span>?
				{:else if currentAction?.type === 'delete'}
					Are you sure you want to <span class="text-[#E52020]">delete</span> this job? This action cannot
					be undone.
				{/if}
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={closeConfirmModal}
					class="cursor-pointer rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 hover:bg-[#EAE9E9]"
				>
					Cancel
				</button>
				<button
					onclick={confirmAction}
					class="cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
