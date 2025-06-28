<script lang="ts">
	const { data } = $props();
	const { jobs } = data;

	import {
		Briefcase,
		MapPin,
		Clock,
		X,
		IndianRupee,
		GraduationCap,
		Star,
		ArrowUpRight
	} from '@lucide/svelte';
	import Fuse from 'fuse.js';
	import MarkdownParser from '$lib/components/MarkdownParser.svelte';

	let selectedJobId = $state(jobs?.[0]?.id || null);
	let mobileModal = $state(false);
	let searchQuery = $state('');
	let searchLocation = $state('');

	let selectedJobType = $state('');
	let selectedExperienceLevel = $state('');
	let selectedLocationType = $state('');
	let selectedCategory = $state('');

	const jobTypes = [...new Set(jobs?.map((job: any) => job.type).filter(Boolean))];
	const experienceLevels = [
		...new Set(jobs?.map((job: any) => job.experienceLevel).filter(Boolean))
	];
	const locationTypes = [...new Set(jobs?.map((job: any) => job.locationType).filter(Boolean))];
	const categories = [...new Set(jobs?.map((job: any) => job.category).filter(Boolean))];

	const fuseOptions = {
		keys: [
			{ name: 'title', weight: 0.4 },
			{ name: 'skills', weight: 0.3 },
			{ name: 'category', weight: 0.2 },
			{ name: 'employer.name', weight: 0.1 },
			{ name: 'description', weight: 0.1 }
		],
		threshold: 0.4,
		includeScore: true,
		includeMatches: true,
		minMatchCharLength: 2
	};

	const fuse = new Fuse(jobs || [], fuseOptions);

	const filteredJobs = $derived.by(() => {
		let result = jobs || [];

		if (searchQuery.trim()) {
			const fuseResults = fuse.search(searchQuery);
			result = fuseResults.map((item) => item.item);
		}

		if (searchLocation.trim()) {
			result = result.filter(
				(job: any) =>
					(job.city && job.city.toLowerCase().includes(searchLocation.toLowerCase())) ||
					(job.country && job.country.toLowerCase().includes(searchLocation.toLowerCase()))
			);
		}

		if (selectedJobType) {
			result = result.filter((job: any) => job.type === selectedJobType);
		}
		if (selectedExperienceLevel) {
			result = result.filter((job: any) => job.experienceLevel === selectedExperienceLevel);
		}
		if (selectedLocationType) {
			result = result.filter((job: any) => job.locationType === selectedLocationType);
		}
		if (selectedCategory) {
			result = result.filter((job: any) => job.category === selectedCategory);
		}

		return result;
	});

	const selectedJob = $derived(filteredJobs.find((job: any) => job.id === selectedJobId) || null);

	$effect(() => {
		if (
			filteredJobs.length > 0 &&
			(!selectedJobId || !filteredJobs.find((job: any) => job.id === selectedJobId))
		) {
			selectedJobId = filteredJobs[0].id;
		}
	});

	function selectJob(job: any) {
		console.log('Selecting job:', job.title, 'ID:', job.id);
		selectedJobId = job.id;
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			mobileModal = true;
		}
	}

	function closeMobileModal() {
		mobileModal = false;
	}

	function clearFilter(filterType: string) {
		switch (filterType) {
			case 'jobType':
				selectedJobType = '';
				break;
			case 'experienceLevel':
				selectedExperienceLevel = '';
				break;
			case 'locationType':
				selectedLocationType = '';
				break;
			case 'category':
				selectedCategory = '';
				break;
		}
	}

	function clearAllFilters() {
		selectedJobType = '';
		selectedExperienceLevel = '';
		selectedLocationType = '';
		selectedCategory = '';
		searchQuery = '';
		searchLocation = '';
	}

	function formatSalary(job: any) {
		if (!job.salaryMin || !job.salaryMax) return 'Salary not specified';
		const currency = job.salaryCurrency || 'INR';
		const type = job.salaryType || 'annual';
		return `${currency} ${job.salaryMin} - ${job.salaryMax} ${type}`;
	}

	function formatDate(dateString: string) {
		if (!dateString) return 'Date not specified';
		return new Date(dateString).toLocaleDateString();
	}

	function handleSearchQueryKeydown(event: KeyboardEvent) {
		// Allow normal input behavior
	}

	function handleSearchLocationKeydown(event: KeyboardEvent) {
		// Allow normal input behavior
	}

	function handleFilterTagKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			action();
		}
	}

	function handleModalOverlayKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeMobileModal();
		}
	}

	function handleModalContentKeydown(event: KeyboardEvent) {
		event.stopPropagation();
	}

	// Complete handleJobApply function
	async function handleJobApply() {
		if (!selectedJobId) return;

		try {
			console.log('Applied for Job Id: ', selectedJobId);

			// Create FormData for SvelteKit form action
			const formData = new FormData();
			formData.append('selectedJobId', selectedJobId.toString());

			// Submit the application
			const res = await fetch('?/apply', {
				method: 'POST',
				body: formData
			});

			// Parse response
			const result = await res.json();

			if (result.type === 'success') {
				console.log('Application submitted successfully');
				// Show success message to user
				alert(`Application submitted successfully for ${result.data.jobTitle}!`);

				// Reload page to update UI and show applied status
				window.location.reload();
			} else if (result.type === 'failure') {
				console.error('Application failed:', result.data?.message);
				// Show error message to user
				alert(result.data?.message || 'Failed to submit application');
			} else {
				// Handle unexpected response format
				console.error('Unexpected response:', result);
				alert('An unexpected error occurred');
			}
		} catch (error) {
			console.error('Error submitting application:', error);
			alert('An error occurred while submitting your application. Please try again.');
		}
	}
</script>

<div class="min-h-screen p-5">
	<div class="mx-auto max-w-6xl">
		<div class="py-20 text-center">
			<h1 class="pb-10 text-3xl font-bold">Find your dream job</h1>

			<div
				class="mx-auto mb-5 flex max-w-2xl flex-col rounded-[10px] border border-gray-300 bg-gray-200 sm:flex-row"
			>
				<div
					class="flex flex-1 items-center gap-5 border-b
					border-gray-300 px-5 py-2.5 sm:border-r sm:border-b-0"
				>
					<Briefcase size="16" class="text-gray-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Job title, skills, category..."
						class="flex-1 outline-none"
						onkeydown={handleSearchQueryKeydown}
					/>
				</div>
				<div class="flex flex-1 items-center gap-5 px-5 py-2.5">
					<MapPin size="16" class="text-gray-400" />
					<input
						type="text"
						bind:value={searchLocation}
						placeholder="City, country..."
						class="flex-1 outline-none"
						onkeydown={handleSearchLocationKeydown}
					/>
				</div>
			</div>

			<div class="mb-5 flex flex-wrap justify-center gap-2.5">
				{#if jobTypes.length > 0}
					<select
						bind:value={selectedJobType}
						class="rounded-[5px] border border-gray-300 px-3 py-1 text-sm focus:outline-none"
					>
						<option value="">All Job Types</option>
						{#each jobTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				{/if}

				{#if experienceLevels.length > 0}
					<select
						bind:value={selectedExperienceLevel}
						class="rounded-[5px] border border-gray-300 px-3 py-1 text-sm focus:outline-none"
					>
						<option value="">All Experience</option>
						{#each experienceLevels as level}
							<option value={level}>{level}</option>
						{/each}
					</select>
				{/if}

				{#if locationTypes.length > 0}
					<select
						bind:value={selectedLocationType}
						class="rounded-[5px] border border-gray-300 px-3 py-1 text-sm focus:outline-none"
					>
						<option value="">All Locations</option>
						{#each locationTypes as locType}
							<option value={locType}>{locType}</option>
						{/each}
					</select>
				{/if}

				{#if categories.length > 0}
					<select
						bind:value={selectedCategory}
						class="rounded-[5px] border border-gray-300 px-3 py-1 text-sm focus:outline-none"
					>
						<option value="">All Categories</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				{/if}
			</div>

			<!-- Active Filters -->
			{#if selectedJobType || selectedExperienceLevel || selectedLocationType || selectedCategory || searchQuery || searchLocation}
				<div class="mb-5 flex flex-wrap justify-center gap-2.5">
					{#if searchQuery}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							Search: "{searchQuery}"
							<button
								onclick={() => (searchQuery = '')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => (searchQuery = ''))}
								aria-label="Remove search filter"
								class="rounded p-0.5 hover:bg-blue-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if searchLocation}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							Location: "{searchLocation}"
							<button
								onclick={() => (searchLocation = '')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => (searchLocation = ''))}
								aria-label="Remove location filter"
								class="rounded p-0.5 hover:bg-blue-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedJobType}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							{selectedJobType}
							<button
								onclick={() => clearFilter('jobType')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('jobType'))}
								aria-label="Remove job type filter"
								class="rounded p-0.5 hover:bg-gray-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedExperienceLevel}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							{selectedExperienceLevel}
							<button
								onclick={() => clearFilter('experienceLevel')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('experienceLevel'))}
								aria-label="Remove experience level filter"
								class="rounded p-0.5 hover:bg-gray-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedLocationType}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							{selectedLocationType}
							<button
								onclick={() => clearFilter('locationType')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('locationType'))}
								aria-label="Remove location type filter"
								class="rounded p-0.5 hover:bg-gray-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedCategory}
						<span
							class="inline-flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-2.5 py-1 text-sm"
						>
							{selectedCategory}
							<button
								onclick={() => clearFilter('category')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('category'))}
								aria-label="Remove category filter"
								class="rounded p-0.5 hover:bg-gray-200"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					<button
						onclick={clearAllFilters}
						onkeydown={(e) => handleFilterTagKeydown(e, clearAllFilters)}
						class="inline-flex items-center gap-2.5 rounded-[5px] bg-red-100 px-2.5 py-1 text-sm text-red-700
						hover:bg-red-200"
						aria-label="Clear all filters"
					>
						Clear All
						<X size="12" />
					</button>
				</div>
			{/if}

			<!-- Results Count -->
			<div class="mb-5 text-sm text-gray-600">
				Showing {filteredJobs.length} of {jobs?.length || 0} jobs
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex h-[calc(100vh-40px)] gap-5">
			<!-- Jobs List -->
			<div
				class="w-full space-y-5 overflow-y-auto
				{filteredJobs.length === 0 ? 'w-full' : 'md:w-1/2'}"
			>
				{#if filteredJobs.length === 0}
					<div class="py-10 text-center">
						<p class="text-gray-500">No jobs found matching your criteria.</p>
						<button
							onclick={clearAllFilters}
							onkeydown={(e) => handleFilterTagKeydown(e, clearAllFilters)}
							class="mt-2.5 cursor-pointer text-blue-600
							underline hover:text-blue-800"
						>
							Clear all filters
						</button>
					</div>
				{:else}
					{#each filteredJobs as job (job.id)}
						<button
							onclick={() => selectJob(job)}
							class="w-full cursor-pointer space-y-5 rounded-[15px] border p-5
							text-left transition-colors {selectedJobId === job.id
								? 'border-[#F14A00] bg-orange-50'
								: 'border-gray-300 bg-white hover:border-[#F14A00]'}"
							aria-label="Select job: {job.title} at {job.employer?.name || 'Company'}"
						>
							<div class="">
								<h2 class="text-lg font-semibold">{job.title}</h2>
								<p class="text-sm font-medium text-gray-600">{job.employer?.name || 'Company'}</p>
							</div>

							{#if job.skills && job.skills.length > 0}
								<div class="flex flex-wrap items-center gap-2.5">
									{#each job.skills.slice(0, 3) as skill}
										<span
											class="rounded-[5px] px-2.5 py-1 text-sm {selectedJobId === job.id
												? 'bg-orange-100'
												: 'bg-gray-100'} ">{skill}</span
										>
									{/each}
									{#if job.skills.length > 3}
										<span class="text-sm text-gray-600">+{job.skills.length - 3} more</span>
									{/if}
								</div>
							{/if}

							<div class="flex flex-wrap items-center gap-5 text-sm text-gray-600">
								<div class="flex items-center gap-2.5">
									<MapPin size="14" />
									<span>
										{#if job.city}
											{job.city}, {job.country || ''} ({job.locationType})
										{:else}
											{job.locationType}
										{/if}
									</span>
								</div>
								<div class="flex items-center gap-2.5">
									<Clock size="14" />
									<span>{job.type}</span>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Job Details -->
			<div
				class=" h-full w-1/2 overflow-y-auto rounded-[15px] border border-gray-300 bg-white p-5
				{filteredJobs.length === 0 ? 'hidden' : 'hidden md:block'} "
			>
				{#if selectedJob}
					<div class="space-y-10">
						<!-- Header -->
						<div class="space-y-5">
							<div class="border-b border-gray-300 pb-5">
								<h1 class="text-2xl font-bold">{selectedJob.title}</h1>
								<p class="text-lg font-semibold text-gray-600">
									{selectedJob.employer?.name || 'Company'}
								</p>
							</div>
							{#if selectedJob.category}
								<div>
									<span
										class="inline-block rounded bg-orange-100 px-2.5 py-1 text-sm text-[#FF4F0F]"
									>
										{selectedJob.category}
									</span>
								</div>
							{/if}
						</div>

						<!-- Key Details -->

						<div class="space-y-5">
							<div class="flex items-start gap-2.5">
								<MapPin size="16" class="mt-1 text-gray-400" />
								<div>
									<p class="text-gray-600">Location</p>
									<p class="font-medium">
										{#if selectedJob.city}
											{selectedJob.city}, {selectedJob.country || ''} ({selectedJob.locationType})
										{:else}
											{selectedJob.locationType}
										{/if}
									</p>
								</div>
							</div>

							<div class="flex items-start gap-2.5">
								<Clock size="16" class="mt-1 text-gray-400" />
								<div>
									<p class="text-gray-600">Job Type</p>
									<p class="font-medium">{selectedJob.type}</p>
								</div>
							</div>

							{#if selectedJob.salaryMin && selectedJob.salaryMax}
								<div class="flex items-start gap-2.5">
									<IndianRupee size="16" class="mt-1 text-gray-400" />
									<div>
										<p class="text-gray-600">Salary</p>
										<p class="font-medium">{formatSalary(selectedJob)}</p>
									</div>
								</div>
							{/if}

							{#if selectedJob.experienceLevel}
								<div class="flex items-start gap-2.5">
									<Star size="16" class="mt-1.25 text-gray-400" />
									<div>
										<p class="text-gray-600">Experience Level</p>
										<p class="font-medium">{selectedJob.experienceLevel}</p>
									</div>
								</div>
							{/if}

							{#if selectedJob.educationLevel}
								<div class="flex items-start gap-2.5">
									<GraduationCap size="16" class="mt-1 text-gray-400" />
									<div>
										<p class="text-gray-600">Education Level</p>
										<p class="font-medium">{selectedJob.educationLevel}</p>
									</div>
								</div>
							{/if}
						</div>

						<!-- Skills -->
						{#if selectedJob.skills && selectedJob.skills.length > 0}
							<div>
								<h3 class="mb-2 font-semibold">Required Skills</h3>
								<div class="flex flex-wrap gap-2">
									{#each selectedJob.skills as skill}
										<span class="rounded bg-gray-100 px-2 py-1 text-sm">{skill}</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Description -->
						{#if selectedJob.description}
							<div>
								<h3 class="mb-2 font-semibold">Job Description</h3>
								<MarkdownParser content={selectedJob.description} />
							</div>
						{/if}

						<!-- Apply Button -->
						<div class="flex gap-5 pt-5">
							<button class="cursor-pointer rounded-full border border-gray-300 px-5 py-2.5"
								>Save</button
							>
							<a href={`/jobs/${selectedJobId}/apply`}>
								<ArrowUpRight />
							</a>
							<button
								onclick={handleJobApply}
								class="block w-full rounded-full border
								border-[#E6521F] bg-[#FF4F0F] px-7.5 py-2.5 text-center text-white hover:bg-[#F14A00]"
							>
								Apply Now
							</button>
						</div>
					</div>
				{:else}
					<div class="flex h-full items-center justify-center">
						<p class="text-gray-500">Select a job to view details</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Mobile Modal -->
{#if mobileModal && selectedJob}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end md:hidden"
		onclick={closeMobileModal}
		onkeydown={handleModalOverlayKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="animate-slide-up max-h-[85vh] w-full overflow-y-auto rounded-t-[20px] border-t border-gray-300 bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleModalContentKeydown}
			role="document"
		>
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white p-5"
			>
				<div class="min-w-0 flex-1">
					<h2 id="modal-title" class="truncate text-xl font-semibold">{selectedJob.title}</h2>
					<p class="truncate font-medium text-gray-600">
						{selectedJob.employer?.name || 'Company'}
					</p>
				</div>
				<button
					onclick={closeMobileModal}
					class="ml-4 flex-shrink-0 cursor-pointer rounded-[10px] p-2 text-gray-600 transition-all hover:bg-gray-100
					 hover:text-black"
					aria-label="Close modal"
				>
					<X size="20" />
				</button>
			</div>

			<div class="space-y-10 p-5">
				{#if selectedJob.category}
					<div>
						<span class="inline-block rounded bg-orange-100 px-2.5 py-1 text-sm text-[#FF4F0F]">
							{selectedJob.category}
						</span>
					</div>
				{/if}

				<div class="space-y-5">
					<div class="flex items-start gap-2.5">
						<MapPin size="16" class="mt-1 text-gray-400" />
						<div>
							<p class="text-gray-600">Location</p>
							<p class="font-medium">
								{#if selectedJob.city}
									{selectedJob.city}, {selectedJob.country || ''} ({selectedJob.locationType})
								{:else}
									{selectedJob.locationType}
								{/if}
							</p>
						</div>
					</div>

					<div class="flex items-start gap-2.5">
						<Clock size="16" class="mt-1 text-gray-400" />
						<div>
							<p class="text-gray-600">Job Type</p>
							<p class="font-medium">{selectedJob.type}</p>
						</div>
					</div>

					{#if selectedJob.salaryMin && selectedJob.salaryMax}
						<div class="flex items-start gap-2.5">
							<IndianRupee size="16" class="mt-1 text-gray-400" />
							<div>
								<p class="text-gray-600">Salary</p>
								<p class="font-medium">{formatSalary(selectedJob)}</p>
							</div>
						</div>
					{/if}

					{#if selectedJob.experienceLevel}
						<div class="flex items-start gap-2.5">
							<Star size="16" class="mt-1.25 text-gray-400" />
							<div>
								<p class="text-gray-600">Experience Level</p>
								<p class="font-medium">{selectedJob.experienceLevel}</p>
							</div>
						</div>
					{/if}

					{#if selectedJob.educationLevel}
						<div class="flex items-start gap-2.5">
							<GraduationCap size="16" class="mt-1 text-gray-400" />
							<div>
								<p class="text-gray-600">Education Level</p>
								<p class="font-medium">{selectedJob.educationLevel}</p>
							</div>
						</div>
					{/if}
				</div>

				{#if selectedJob.skills && selectedJob.skills.length > 0}
					<div>
						<h3 class="mb-3 text-sm font-semibold">Required Skills</h3>
						<div class="flex flex-wrap gap-2">
							{#each selectedJob.skills as skill}
								<span class="rounded-[5px] bg-gray-100 px-2.5 py-1">{skill}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if selectedJob.description}
					<div>
						<h3 class="mb-3 text-sm font-semibold">Job Description</h3>
						<MarkdownParser content={selectedJob.description} />
					</div>
				{/if}
			</div>

			<div
				class="sticky bottom-0 flex gap-5 border-t border-gray-300
			 bg-white p-5"
			>
				<button class="cursor-pointer rounded-full border border-gray-300 px-5 py-2.5">Save</button>
				<a
					href={`/jobs/${selectedJobId}/apply`}
					class="block w-full rounded-full border
						border-[#E6521F] bg-[#FF4F0F] px-7.5 py-2.5 text-center text-white hover:bg-[#F14A00]"
				>
					Apply Now
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
