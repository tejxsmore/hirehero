<script lang="ts">
	import {
		Briefcase,
		MapPin,
		Clock,
		X,
		IndianRupee,
		GraduationCap,
		Star,
		ChevronDown,
		Check,
		FileText, // Added for file icon
		CheckCircle, // Added for checkmark icon
		Settings // Added for CV options icon
	} from '@lucide/svelte';
	import Fuse from 'fuse.js';
	import MarkdownParser from '$lib/components/MarkdownParser.svelte';
	import { userStore } from '$lib/stores/user.js';
	import { goto } from '$app/navigation';

	const { data } = $props();
	const { jobs, savedJobIds: initialSavedJobIds, profile } = data;

	let isLoggedIn = $state($userStore != null);
	let message = $state('');
	let messageType = $state<'success' | 'error' | ''>('');
	let savingJob = $state(false);
	let savedJobIds = $state(new Set<string>(initialSavedJobIds || []));
	let showSaveTooltip = $state(false);
	let showApplyTooltip = $state(false);
	let selectedJobId = $state(jobs?.[0]?.id || null);
	let mobileModal = $state(false);

	let searchQuery = $state('');
	let searchLocation = $state('');
	let selectedJobType = $state('');
	let selectedExperienceLevel = $state('');
	let selectedLocationType = $state('');
	let selectedCategory = $state('');

	// Apply states
	let applyModal = $state(false);

	// Dropdown states
	let isJobTypeDropdownOpen = $state(false);
	let isExperienceLevelDropdownOpen = $state(false);
	let isLocationTypeDropdownOpen = $state(false);
	let isCategoryDropdownOpen = $state(false);

	// Track if user just clicked to prevent tooltip on hover after click
	let justClicked = $state({
		save: false,
		apply: false
	});

	// Derived state to check if the currently selected job is saved
	const isCurrentJobSaved = $derived(selectedJobId ? savedJobIds.has(selectedJobId) : false);

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

	// Effect to control body scroll when mobile modal is open
	$effect(() => {
		if (mobileModal) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = ''; // Reset to default
		}
		// Cleanup function for the effect
		return () => {
			document.body.style.overflow = '';
		};
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

	// New function to close apply modal
	function closeApplyModal() {
		applyModal = false;
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

		const currencySymbolMap: Record<string, string> = {
			INR: '₹',
			USD: '$',
			EUR: '€',
			GBP: '£'
			// Add more currencies if needed
		};

		const currency = job.salaryCurrency || 'INR';
		const symbol = currencySymbolMap[currency] || currency;
		const type = job.salaryType?.slice(4).toLowerCase() || '';

		// Format functions
		const formatToK = (num: number) => `${Math.round(num / 1000)}K`;
		const formatToL = (num: number) => `${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;

		// Decide format
		let salaryFormatted: string;
		if (job.salaryType === 'Per Year') {
			salaryFormatted = `${formatToL(job.salaryMin)} - ${formatToL(job.salaryMax)}`;
		} else {
			salaryFormatted = `${formatToK(job.salaryMin)} - ${formatToK(job.salaryMax)}`;
		}

		return `${symbol} ${salaryFormatted} /${type}`;
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

	// Generic keydown handler for modal overlays
	function handleOverlayKeydown(event: KeyboardEvent, closeFn: () => void) {
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault(); // Prevent default action for space/enter
			closeFn();
		}
	}

	// Updated handleModalContentKeydown to stop propagation for keyboard events
	function handleModalContentKeydown(event: KeyboardEvent) {
		event.stopPropagation();
	}

	// Dropdown functions
	function toggleJobTypeDropdown() {
		isJobTypeDropdownOpen = !isJobTypeDropdownOpen;
		isExperienceLevelDropdownOpen = false;
		isLocationTypeDropdownOpen = false;
		isCategoryDropdownOpen = false;
	}

	function toggleExperienceLevelDropdown() {
		isExperienceLevelDropdownOpen = !isExperienceLevelDropdownOpen;
		isJobTypeDropdownOpen = false;
		isLocationTypeDropdownOpen = false;
		isCategoryDropdownOpen = false;
	}

	function toggleLocationTypeDropdown() {
		isLocationTypeDropdownOpen = !isLocationTypeDropdownOpen;
		isJobTypeDropdownOpen = false;
		isExperienceLevelDropdownOpen = false;
		isCategoryDropdownOpen = false;
	}

	function toggleCategoryDropdown() {
		isCategoryDropdownOpen = !isCategoryDropdownOpen;
		isJobTypeDropdownOpen = false;
		isExperienceLevelDropdownOpen = false;
		isLocationTypeDropdownOpen = false;
	}

	function selectJobType(type: string) {
		selectedJobType = type;
		isJobTypeDropdownOpen = false;
	}

	function selectExperienceLevel(level: string) {
		selectedExperienceLevel = level;
		isExperienceLevelDropdownOpen = false;
	}

	function selectLocationType(locType: string) {
		selectedLocationType = locType;
		isLocationTypeDropdownOpen = false;
	}

	function selectCategory(category: string) {
		selectedCategory = category;
		isCategoryDropdownOpen = false;
	}

	function handleTooltipEnter(buttonType: 'save' | 'apply') {
		if (buttonType === 'save') {
			if (!isLoggedIn && !justClicked.save) {
				showSaveTooltip = true;
			}
		} else if (buttonType === 'apply') {
			// Show tooltip if not logged in OR if logged in but profile is null
			if ((!isLoggedIn || profile === null) && !justClicked.apply) {
				showApplyTooltip = true;
			}
		}
	}

	function handleTooltipLeave(buttonType: 'save' | 'apply') {
		if (buttonType === 'save' && !justClicked.save) {
			showSaveTooltip = false;
		} else if (buttonType === 'apply' && !justClicked.apply) {
			showApplyTooltip = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		// Close dropdowns
		const dropdownContainers = document.querySelectorAll('.dropdown-container');
		let clickedInsideDropdown = false;
		for (const container of Array.from(dropdownContainers)) {
			if (container.contains(target)) {
				clickedInsideDropdown = true;
				break;
			}
			// Also check if the click was on the dropdown button itself
			if (target.closest('button[aria-haspopup="listbox"]')) {
				clickedInsideDropdown = true;
				break;
			}
		}

		if (!clickedInsideDropdown) {
			isJobTypeDropdownOpen = false;
			isExperienceLevelDropdownOpen = false;
			isLocationTypeDropdownOpen = false;
			isCategoryDropdownOpen = false;
		}

		// Hide sign-in tooltips if click is outside both save and apply buttons
		if (!target.closest('.save-button-container') && !target.closest('.apply-button-container')) {
			showSaveTooltip = false;
			showApplyTooltip = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isJobTypeDropdownOpen = false;
			isExperienceLevelDropdownOpen = false;
			isLocationTypeDropdownOpen = false;
			isCategoryDropdownOpen = false;
			showSaveTooltip = false; // Also hide save tooltip on escape
			showApplyTooltip = false; // Also hide apply tooltip on escape
		}
	}

	async function handleJobSave(jobId: string) {
		// Set click flag and hide tooltip immediately
		justClicked.save = true;
		showSaveTooltip = false;
		// Reset click flag after a short delay
		setTimeout(() => {
			justClicked.save = false;
		}, 300);

		if (!isLoggedIn) {
			// If not logged in, redirect to login page
			goto('/login');
			return;
		}

		if (savingJob) {
			return;
		}

		console.log('Attempting to save job:', jobId);
		message = '';
		messageType = '';
		savingJob = true;

		// Optimistic update: Create a new Set to ensure reactivity
		savedJobIds = new Set(savedJobIds.add(jobId));

		try {
			const response = await fetch('/api/jobs/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ jobId })
			});

			const result = await response.json();

			if (response.ok) {
				message = result.message;
				messageType = 'success';
				console.log('Job saved successfully:', result.message);
			} else {
				// Revert optimistic update on error: Create a new Set after deletion
				const newSavedJobIds = new Set(savedJobIds);
				newSavedJobIds.delete(jobId);
				savedJobIds = newSavedJobIds;
				message = result.message || 'Failed to save job.';
				messageType = 'error';
				console.error('Error saving job:', result.message);
			}
		} catch (error) {
			// Revert optimistic update on network/unexpected error: Create a new Set after deletion
			const newSavedJobIds = new Set(savedJobIds);
			newSavedJobIds.delete(jobId);
			savedJobIds = newSavedJobIds;
			message = 'An unexpected error occurred.';
			messageType = 'error';
			console.error('Network or unexpected error:', error);
		} finally {
			savingJob = false; // End loading state
		}
	}

	async function handleJobApply() {
		justClicked.apply = true;
		showApplyTooltip = false;

		// Reset click flag after a short delay
		setTimeout(() => {
			justClicked.apply = false;
		}, 300);

		console.log(`User applied for ${selectedJob?.title} job`);
		try {
			const response = await fetch('/api/jobs/apply', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ jobId: selectedJob?.id, resumeUrl: profile?.resumeUrl })
			});

			const result = await response.json();
			if (response.ok) {
				message = result.message;
				messageType = 'success';
				console.log('Job applied successfully:', result.message);
			} else {
				message = result.message || 'Failed to save job.';
				messageType = 'error';
				console.error('Error saving job:', result.message);
			}
		} catch (error) {
			console.error('Network or unexpected error:', error);
		} finally {
			applyModal = false;
		}
	}

	function getFileNameFromUrl(url: string): string {
		try {
			const urlObj = new URL(url);
			const pathSegments = urlObj.pathname.split('/');
			const filename = pathSegments[pathSegments.length - 1];
			const parts = filename.split('-');
			const cleanFileName = parts.slice(2).join('-');
			return cleanFileName;
		} catch (e) {
			console.error('Invalid URL for filename extraction:', url, e);
			return 'resume.pdf'; // Fallback for invalid URLs
		}
	}
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="min-h-screen p-4.5 lg:px-20 xl:px-40">
	<div class="mx-auto space-y-4.5">
		<div class="py-20 text-center">
			<h1 class="pb-12 text-3xl font-bold">Find your dream job</h1>
			<div
				class="mx-auto mb-4.5 flex max-w-2xl flex-col rounded-[15px] border border-[#D4D7DD] bg-[#e8e8e8] sm:flex-row"
			>
				<div
					class="flex flex-1 items-center gap-4.5 border-b
                    border-[#D4D7DD] px-4.5 py-3 sm:border-r sm:border-b-0"
				>
					<Briefcase size="16" class="text-[#57564F]" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Job title, skills, category..."
						class="flex-1 outline-none placeholder:text-[#57564F]"
						onkeydown={handleSearchQueryKeydown}
					/>
				</div>
				<div class="flex flex-1 items-center gap-4.5 px-4.5 py-3">
					<MapPin size="16" class="text-[#57564F]" />
					<input
						type="text"
						bind:value={searchLocation}
						placeholder="City, country..."
						class="flex-1 outline-none placeholder:text-[#57564F]"
						onkeydown={handleSearchLocationKeydown}
					/>
				</div>
			</div>
			<div class="mb-4.5 flex flex-wrap justify-center gap-3">
				{#if jobTypes.length > 0}
					<!-- Job Type Custom Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleJobTypeDropdown}
							class="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] border border-[#D4D7DD]
                            bg-[#e8e8e8] px-3 py-1 text-sm focus:outline-none"
							aria-expanded={isJobTypeDropdownOpen}
							aria-haspopup="listbox"
						>
							<span>{selectedJobType || 'All Job Types'}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {isJobTypeDropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>
						{#if isJobTypeDropdownOpen}
							<div
								class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-1 space-y-1 overflow-hidden rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm duration-300"
								role="listbox"
							>
								<button
									onclick={() => selectJobType('')}
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all duration-300 hover:bg-[#DDDDDD] focus:outline-none
                                    {selectedJobType === ''
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									role="option"
									aria-selected={selectedJobType === ''}
								>
									<span>All Job Types</span>
								</button>
								{#each jobTypes as type}
									<button
										onclick={() => selectJobType(type)}
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all
                                        duration-300 hover:bg-[#DDDDDD] focus:outline-none
                                        {selectedJobType === type
											? 'bg-[#EAE9E9]'
											: 'hover:bg-[#f6f6f6]'}"
										role="option"
										aria-selected={selectedJobType === type}
									>
										<span>{type}</span>
										{#if selectedJobType === type}
											<Check size="12" />
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{#if experienceLevels.length > 0}
					<!-- Experience Level Custom Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleExperienceLevelDropdown}
							class="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] border border-[#D4D7DD]
                            bg-[#e8e8e8] px-3 py-1 text-sm focus:outline-none"
							aria-expanded={isExperienceLevelDropdownOpen}
							aria-haspopup="listbox"
						>
							<span>{selectedExperienceLevel || 'All Experience'}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {isExperienceLevelDropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>
						{#if isExperienceLevelDropdownOpen}
							<div
								class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-1 space-y-1 overflow-hidden rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm duration-300"
								role="listbox"
							>
								<button
									onclick={() => selectExperienceLevel('')}
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all duration-300 hover:bg-[#f6f6f6] focus:outline-none
                                    {selectedExperienceLevel === '' ? 'bg-[#EAE9E9]' : ''}"
									role="option"
									aria-selected={selectedExperienceLevel === ''}
								>
									<span>All Experience</span>
								</button>
								{#each experienceLevels as level}
									<button
										onclick={() => selectExperienceLevel(level)}
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all
                                        duration-300 hover:bg-[#DDDDDD] focus:outline-none
                                        {selectedExperienceLevel === level
											? 'bg-[#EAE9E9]'
											: 'hover:bg-[#f6f6f6]'}"
										role="option"
										aria-selected={selectedExperienceLevel === level}
									>
										<span>{level}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{#if locationTypes.length > 0}
					<!-- Location Type Custom Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleLocationTypeDropdown}
							class="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] border border-[#D4D7DD] bg-[#e8e8e8] px-3 py-1 text-sm focus:outline-none"
							aria-expanded={isLocationTypeDropdownOpen}
							aria-haspopup="listbox"
						>
							<span>{selectedLocationType || 'All Locations'}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {isLocationTypeDropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>
						{#if isLocationTypeDropdownOpen}
							<div
								class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-1 space-y-1 overflow-hidden rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm duration-300"
								role="listbox"
							>
								<button
									onclick={() => selectLocationType('')}
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all duration-300 hover:bg-[#f6f6f6] focus:outline-none
                                    {selectedLocationType === '' ? 'bg-[#EAE9E9]' : ''}"
									role="option"
									aria-selected={selectedLocationType === ''}
								>
									<span>All Locations</span>
								</button>
								{#each locationTypes as locType}
									<button
										onclick={() => selectLocationType(locType)}
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all
                                        duration-300 focus:outline-none
                                        {selectedLocationType === locType
											? 'bg-[#EAE9E9]'
											: 'hover:bg-[#f6f6f6] '}"
										role="option"
										aria-selected={selectedLocationType === locType}
									>
										<span>{locType}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{#if categories.length > 0}
					<!-- Category Custom Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleCategoryDropdown}
							class="flex cursor-pointer items-center justify-between gap-2 rounded-[9px] border border-[#D4D7DD] bg-[#e8e8e8] px-3 py-1 text-sm focus:outline-none"
							aria-expanded={isCategoryDropdownOpen}
							aria-haspopup="listbox"
						>
							<span>{selectedCategory || 'All Categories'}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {isCategoryDropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>
						{#if isCategoryDropdownOpen}
							<div
								class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-1 space-y-1 overflow-hidden rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm duration-300"
								role="listbox"
							>
								<button
									onclick={() => selectCategory('')}
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all duration-300
                                    focus:outline-none
                                    {selectedCategory === ''
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6] '}"
									role="option"
									aria-selected={selectedCategory === ''}
								>
									<span>All Categories</span>
								</button>
								{#each categories as category}
									<button
										onclick={() => selectCategory(category)}
										class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-sm transition-all
                                        duration-300 focus:outline-none
                                        {selectedCategory === category
											? 'bg-[#EAE9E9]'
											: 'hover:bg-[#f6f6f6] '}"
										role="option"
										aria-selected={selectedCategory === category}
									>
										<span>{category}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<!-- Active Filters -->
			{#if selectedJobType || selectedExperienceLevel || selectedLocationType || selectedCategory || searchQuery || searchLocation}
				<div class="mb-4.5 flex flex-wrap justify-center gap-3">
					{#if searchQuery}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							Search: "{searchQuery}"
							<button
								onclick={() => (searchQuery = '')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => (searchQuery = ''))}
								aria-label="Remove search filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if searchLocation}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							Location: "{searchLocation}"
							<button
								onclick={() => (searchLocation = '')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => (searchLocation = ''))}
								aria-label="Remove location filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedJobType}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							{selectedJobType}
							<button
								onclick={() => clearFilter('jobType')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('jobType'))}
								aria-label="Remove job type filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedExperienceLevel}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							{selectedExperienceLevel}
							<button
								onclick={() => clearFilter('experienceLevel')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('experienceLevel'))}
								aria-label="Remove experience level filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedLocationType}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							{selectedLocationType}
							<button
								onclick={() => clearFilter('locationType')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('locationType'))}
								aria-label="Remove location type filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					{#if selectedCategory}
						<span
							class="inline-flex items-center gap-3 rounded-[9px] border border-[#c5c8cd] bg-[#D4D7DD] px-3 py-1 text-sm"
						>
							{selectedCategory}
							<button
								onclick={() => clearFilter('category')}
								onkeydown={(e) => handleFilterTagKeydown(e, () => clearFilter('category'))}
								aria-label="Remove category filter"
								class="cursor-pointer rounded p-0.5
                                transition-all duration-300 hover:text-red-500"
							>
								<X size="12" />
							</button>
						</span>
					{/if}
					<button
						onclick={clearAllFilters}
						onkeydown={(e) => handleFilterTagKeydown(e, clearAllFilters)}
						class="cursor-pointer rounded-[9px] border border-[#B80000] bg-[#E52020] px-3 py-1 text-sm text-[#F6F6F6] transition-all duration-300 hover:bg-[#C40C0C]"
						aria-label="Clear all filters"
					>
						Clear All
					</button>
				</div>
			{/if}
			<!-- Results Count -->
			<div class="mb-4.5 text-sm text-[#7A7A73]">
				Showing {filteredJobs.length} of {jobs?.length || 0} jobs
			</div>
		</div>
		<!-- Main Content -->
		<div class="flex gap-4.5">
			<!-- Jobs List -->
			<div
				class="w-full space-y-4.5 overflow-y-auto will-change-transform
                {filteredJobs.length === 0 ? 'w-full' : 'md:w-1/2'}"
			>
				{#if filteredJobs.length === 0}
					<div class="text-center">
						<p class="">No jobs found matching your criteria.</p>
						<button
							onclick={clearAllFilters}
							onkeydown={(e) => handleFilterTagKeydown(e, clearAllFilters)}
							class="mt-3 cursor-pointer text-[#E52020]
                            underline hover:text-[#FF0000]"
						>
							Clear all filters
						</button>
					</div>
				{:else}
					{#each filteredJobs as job (job.id)}
						<button
							onclick={() => selectJob(job)}
							class="w-full cursor-pointer space-y-4.5 rounded-[15px] border border-[#EAE9E9] bg-white p-4.5 text-left"
							aria-label="Select job: {job.title} at {job.employer?.name || 'Company'}"
						>
							<div class="">
								<h2 class="text-lg font-semibold">{job.title}</h2>
								<p class="text-sm font-medium text-[#7A7A73]">{job.employer?.name || 'Company'}</p>
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
						</button>
					{/each}
				{/if}
			</div>
			<!-- Job Details -->
			<div
				class="sticky top-4.5 w-1/2 overflow-y-auto rounded-[15px] border border-[#EAE9E9] bg-white will-change-transform md:h-[calc(100vh-35px)]
                {filteredJobs.length === 0 ? 'hidden' : 'hidden md:block'} "
			>
				{#if selectedJob}
					<div class="sticky top-0 space-y-1.5 border-b border-[#EAE9E9] bg-white p-4.5">
						<h1 class="truncate text-2xl font-bold">{selectedJob.title}</h1>
						<p class="truncate font-semibold text-[#7A7A73]">
							{selectedJob.employer?.name || 'Company'}
						</p>
					</div>
					<div class="space-y-12 p-4.5">
						<!-- Header -->
						<div class="space-y-4.5">
							{#if selectedJob.category}
								<div>
									<span
										class="inline-block rounded-[9px] bg-[#EAE9E9]
                                        px-3 py-1"
									>
										{selectedJob.category}
									</span>
								</div>
							{/if}
						</div>
						<!-- Key Details -->
						<div class="space-y-4.5">
							<div class="flex items-start gap-3">
								<MapPin size="16" class="mt-1 text-[#7A7A73]" />
								<div>
									<p class="text-[#7A7A73]">Location</p>
									<p class="font-medium">
										{#if selectedJob.city}
											{selectedJob.city}, {selectedJob.country || ''} ({selectedJob.locationType})
										{:else}
											{selectedJob.locationType}
										{/if}
									</p>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Clock size="16" class="mt-1 text-[#7A7A73]" />
								<div>
									<p class="text-[#7A7A73]">Job Type</p>
									<p class="font-medium">{selectedJob.type}</p>
								</div>
							</div>
							{#if selectedJob.salaryMin && selectedJob.salaryMax}
								<div class="flex items-start gap-3">
									<IndianRupee size="16" class="mt-1 text-[#7A7A73]" />
									<div>
										<p class="text-[#7A7A73]">Salary</p>
										<p class="font-medium">{formatSalary(selectedJob)}</p>
									</div>
								</div>
							{/if}
							{#if selectedJob.experienceLevel}
								<div class="flex items-start gap-3">
									<Star size="16" class="mt-1.25 text-[#7A7A73]" />
									<div>
										<p class="text-[#7A7A73]">Experience Level</p>
										<p class="font-medium">{selectedJob.experienceLevel}</p>
									</div>
								</div>
							{/if}
							{#if selectedJob.educationLevel}
								<div class="flex items-start gap-3">
									<GraduationCap size="16" class="mt-1 text-[#7A7A73]" />
									<div>
										<p class="text-[#7A7A73]">Education Level</p>
										<p class="font-medium">{selectedJob.educationLevel}</p>
									</div>
								</div>
							{/if}
						</div>
						<!-- Skills -->
						{#if selectedJob.skills && selectedJob.skills.length > 0}
							<div>
								<h3 class="mb-3 font-semibold">Required Skills</h3>
								<div class="flex flex-wrap gap-3">
									{#each selectedJob.skills as skill}
										<span class="rounded-[9px] bg-[#F6F6F6] px-3 py-1 text-sm">{skill}</span>
									{/each}
								</div>
							</div>
						{/if}
						<!-- Description -->
						{#if selectedJob.description}
							<div>
								<h3 class="mb-3 font-semibold">Job Description</h3>
								<MarkdownParser content={selectedJob.description} />
							</div>
						{/if}
					</div>
					<div class="sticky bottom-0 flex gap-4.5 border-t border-[#EAE9E9] bg-white p-4.5">
						<div class="save-button-container group relative">
							{#if !isLoggedIn}
								<span
									class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                                    {showSaveTooltip ? 'opacity-100' : 'opacity-0'}"
								>
									Login
								</span>
							{/if}
							<button
								onclick={() => handleJobSave(selectedJobId!)}
								onmouseenter={() => handleTooltipEnter('save')}
								onmouseleave={() => handleTooltipLeave('save')}
								disabled={savingJob || isCurrentJobSaved}
								class="cursor-pointer rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 transition-colors duration-300
                                disabled:cursor-not-allowed
                                {savingJob ? 'opacity-70' : ''}"
							>
								{#if savingJob}
									Saving...
								{:else if isCurrentJobSaved}
									Saved
								{:else}
									Save
								{/if}
							</button>
						</div>
						<div class="apply-button-container group relative w-full">
							{#if !isLoggedIn}
								<span
									class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                                    {showApplyTooltip ? 'opacity-100' : 'opacity-0'}"
								>
									Login
								</span>
							{:else if profile === null}
								<span
									class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                                    {showApplyTooltip ? 'opacity-100' : 'opacity-0'}"
								>
									Create profile to apply
								</span>
							{/if}
							<button
								onclick={() => {
									if (!isLoggedIn) {
										goto('/login'); // Redirect to login page
									} else if (profile === null) {
										goto('/user/profile'); // Redirect to profile creation
									} else {
										applyModal = true; // Open modal if logged in and has profile
									}
								}}
								onmouseenter={() => handleTooltipEnter('apply')}
								onmouseleave={() => handleTooltipLeave('apply')}
								class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
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
	<div
		class="fixed inset-0 z-50 flex items-end md:hidden"
		onclick={closeMobileModal}
		onkeydown={(e) => handleOverlayKeydown(e, closeMobileModal)}
		role="button"
		tabindex="0"
		aria-label="Close job details modal"
	>
		<div
			class="animate-slide-up max-h-[85vh] w-full overflow-y-auto overscroll-y-contain rounded-t-[20px] border-t border-[#EAE9E9] bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleModalContentKeydown}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="modal-title"
		>
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAE9E9] bg-white p-4.5"
			>
				<div class="min-w-0 flex-1 space-y-1.5">
					<h2 id="modal-title" class="truncate text-xl font-semibold">{selectedJob.title}</h2>
					<p class="truncate font-medium text-[#57564F]">
						{selectedJob.employer?.name || 'Company'}
					</p>
				</div>
				<button
					onclick={closeMobileModal}
					class="cursor-pointer text-[#7A7A73] focus:outline-none"
					aria-label="Close modal"
				>
					<X size="20" />
				</button>
			</div>
			<div class="space-y-12 p-4.5">
				{#if selectedJob.category}
					<div>
						<span class="inline-block rounded-[9px] bg-[#EAE9E9] px-3 py-1">
							{selectedJob.category}
						</span>
					</div>
				{/if}
				<div class="space-y-4.5">
					<div>
						<div class="flex items-center gap-3">
							<MapPin size="12" class="text-[#7A7A73]" />
							<p class="text-sm text-[#7A7A73]">Location</p>
						</div>
						<p class="pl-6 font-medium">
							{#if selectedJob.city}
								{selectedJob.city}, {selectedJob.country || ''} ({selectedJob.locationType})
							{:else}
								{selectedJob.locationType}
							{/if}
						</p>
					</div>
					<div>
						<div class="flex items-center gap-3">
							<Clock size="12" class="text-[#7A7A73]" />
							<p class="text-sm text-[#7A7A73]">Job Type</p>
						</div>
						<p class="pl-6 font-medium">{selectedJob.type}</p>
					</div>
					{#if selectedJob.salaryMin && selectedJob.salaryMax}
						<div>
							<div class="flex items-center gap-3">
								<IndianRupee size="12" class="text-[#7A7A73]" />
								<p class="text-sm text-[#7A7A73]">Salary</p>
							</div>
							<p class="pl-6 font-medium">{formatSalary(selectedJob)}</p>
						</div>
					{/if}
					{#if selectedJob.experienceLevel}
						<div>
							<div class="flex items-center gap-3">
								<Star size="12" class="text-[#7A7A73]" />
								<p class="text-sm text-[#7A7A73]">Experience Level</p>
							</div>
							<p class="pl-6 font-medium">{selectedJob.experienceLevel}</p>
						</div>
					{/if}
					{#if selectedJob.educationLevel}
						<div>
							<div class="flex items-center gap-3">
								<GraduationCap size="12" class="text-[#7A7A73]" />
								<p class="text-sm text-[#7A7A73]">Education Level</p>
							</div>
							<p class="pl-6 font-medium">{selectedJob.educationLevel}</p>
						</div>
					{/if}
				</div>
				{#if selectedJob.skills && selectedJob.skills.length > 0}
					<div>
						<h3 class="mb-6 font-semibold">Required Skills</h3>
						<div class="flex flex-wrap gap-3">
							{#each selectedJob.skills as skill}
								<span class="rounded-[9px] bg-[#F6F6F6] px-3 py-1 text-sm">{skill}</span>
							{/each}
						</div>
					</div>
				{/if}
				{#if selectedJob.description}
					<div>
						<h3 class="mb-3 font-semibold">Job Description</h3>
						<MarkdownParser content={selectedJob.description} />
					</div>
				{/if}
			</div>
			<div
				class="sticky bottom-0 flex gap-6 border-t border-[#EAE9E9]
                bg-white p-6"
			>
				<div class="save-button-container group relative">
					{#if !isLoggedIn}
						<span
							class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                            {showSaveTooltip ? 'opacity-100' : 'opacity-0'}"
						>
							Login
						</span>
					{/if}
					<button
						onclick={() => handleJobSave(selectedJobId!)}
						onmouseenter={() => handleTooltipEnter('save')}
						onmouseleave={() => handleTooltipLeave('save')}
						disabled={savingJob || isCurrentJobSaved}
						class="cursor-pointer rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 transition-colors duration-300
                        disabled:cursor-not-allowed
                        {savingJob ? 'opacity-70' : ''}"
					>
						{#if savingJob}
							Saving...
						{:else if isCurrentJobSaved}
							Saved
						{:else}
							Save
						{/if}
					</button>
				</div>
				<div class="apply-button-container group relative w-full">
					{#if !isLoggedIn}
						<span
							class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                            {showApplyTooltip ? 'opacity-100' : 'opacity-0'}"
						>
							Login
						</span>
					{:else if profile === null}
						<span
							class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-[9px] bg-[#57564F] px-3 py-1 text-sm whitespace-nowrap text-white transition-opacity duration-300
                            {showApplyTooltip ? 'opacity-100' : 'opacity-0'}"
						>
							Create profile to apply
						</span>
					{/if}
					<button
						onclick={() => {
							if (!isLoggedIn) {
								goto('/login'); // Redirect to login page
							} else if (profile === null) {
								goto('/user/profile'); // Redirect to profile creation
							} else {
								applyModal = true; // Open modal if logged in and has profile
							}
						}}
						onmouseenter={() => handleTooltipEnter('apply')}
						onmouseleave={() => handleTooltipLeave('apply')}
						class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
					>
						Apply Now
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if applyModal}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4.5"
		onclick={closeApplyModal}
		onkeydown={(e) => handleOverlayKeydown(e, closeApplyModal)}
		role="button"
		tabindex="0"
		aria-label="Close application modal"
	>
		<div
			class="modal-content w-full max-w-sm space-y-4.5 rounded-[15px] border border-[#EAE9E9] bg-white p-4.5"
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleModalContentKeydown}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="apply-modal-title"
		>
			<h2 id="apply-modal-title" class="text-lg font-semibold">Resume</h2>
			{#if profile?.resumeUrl}
				<a href={profile.resumeUrl} target="_blank" class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<FileText size="18" class="text-[#7A7A73]" />
						<span class="font-medium">{getFileNameFromUrl(profile.resumeUrl)}</span>
					</div>
					<CheckCircle size="16" class="text-[#06923E]" />
				</a>
				<button class="w-full rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 text-center"
					>Edit Profile</button
				>
			{:else}
				<p>No resume uploaded. Please create your profile to upload a resume.</p>
			{/if}
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (applyModal = false)}
					class="rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 hover:bg-[#EAE9E9]"
				>
					Cancel
				</button>
				<button
					onclick={handleJobApply}
					class="w-full cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
				>
					Apply
				</button>
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
