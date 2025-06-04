<script lang="ts">
	import {
		TrendingUp,
		Briefcase,
		Users,
		Building2,
		Settings,
		Calendar,
		LayoutDashboard,
		Plus,
		Search,
		MessageCircle,
		ChevronDown,
		Check
	} from '@lucide/svelte';

	const { employer } = $props();

	type ViewKey =
		| 'dashboard'
		| 'jobs'
		| 'applications'
		| 'messages'
		| 'interviews'
		| 'company-profile'
		| 'settings';
	let activeView = $state<ViewKey>('dashboard');
	let searchQuery = $state('');
	let isDropdownOpen = $state(false);

	const navItems: { label: string; view: ViewKey; icon: typeof LayoutDashboard }[] = [
		{ label: 'Dashboard', view: 'dashboard', icon: TrendingUp },
		{ label: 'Jobs', view: 'jobs', icon: Briefcase },
		{ label: 'Applications', view: 'applications', icon: Users },
		{ label: 'Messages', view: 'messages', icon: MessageCircle },
		{ label: 'Interviews', view: 'interviews', icon: Calendar },
		{ label: 'Company Profile', view: 'company-profile', icon: Building2 },
		{ label: 'Settings', view: 'settings', icon: Settings }
	];

	const currentItem = $derived(navItems.find((i) => i.view === activeView));

	function selectView(view: ViewKey) {
		activeView = view;
		isDropdownOpen = false;
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			isDropdownOpen = false;
		}
	}

	// Close dropdown on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="flex min-h-screen w-full bg-gray-50 text-[#343131]">
	<!-- Desktop Sidebar -->
	<aside
		class="hidden w-80 flex-col space-y-5 border-t border-dashed border-[#706D54] bg-[#343131] p-5
		text-white md:flex"
	>
		<div>
			<h1 class="text-2xl font-bold">{employer.companyName}</h1>
			<p class="text-gray-400">Employer dashboard</p>
		</div>

		<nav class="space-y-2.5">
			{#each navItems as { label, view, icon: Icon }}
				<button
					onclick={() => (activeView = view)}
					class="flex w-full cursor-pointer items-center gap-5 rounded-[10px] p-2 px-5 transition-colors
					{activeView === view ? 'bg-[#706D54]' : 'hover:bg-[#706D54]'}"
				>
					<Icon size="16" />
					<span>{label}</span>
				</button>
			{/each}
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 space-y-5 p-5">
		<div class="block md:hidden">
			<!-- Advanced Custom Dropdown -->
			<div class="dropdown-container relative">
				<button
					onclick={toggleDropdown}
					class="flex w-full cursor-pointer items-center justify-between
					rounded-[10px] bg-[#706D54] px-5 py-2 text-white transition-all duration-200 focus:outline-none"
					aria-expanded={isDropdownOpen}
					aria-haspopup="listbox"
				>
					<div class="flex items-center gap-5">
						{#if currentItem}
							<div class="">
								<currentItem.icon size="16" />
							</div>
							<span class="font-medium">{currentItem.label}</span>
						{/if}
					</div>
					<ChevronDown
						size="16"
						class="text-white transition-transform duration-200 {isDropdownOpen
							? 'rotate-180 '
							: ''}"
					/>
				</button>

				{#if isDropdownOpen}
					<div
						class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-2.5 space-y-1 overflow-hidden rounded-[10px] bg-[#343131] p-1 duration-200"
						role="listbox"
					>
						{#each navItems as { label, view, icon: Icon }, index}
							<button
								onclick={() => selectView(view)}
								class="flex w-full cursor-pointer items-center justify-between rounded-[10px] px-5 py-2 text-white transition-all
								duration-200 hover:bg-[#706D54] focus:outline-none
								{activeView === view ? 'bg-[#343131] text-white' : 'text-[#343131]'}"
								role="option"
								aria-selected={activeView === view}
							>
								<div class="flex items-center gap-5">
									<Icon size="14" class="text-white" />
									<span class="flex-1 font-medium">{label}</span>
								</div>
								{#if activeView === view}
									<Check size="14" class="" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Page Title -->
		<div class="flex flex-col gap-5 md:flex-row md:justify-between">
			<h2 class="text-3xl font-bold">{currentItem?.label}</h2>
		</div>

		<!-- View-specific content -->
		{#if activeView === 'dashboard'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Dashboard Overview</h3>
				<p class="text-gray-600">
					Welcome to your employer dashboard. Here you can manage jobs, view applications, and track
					your hiring process.
				</p>
			</div>
		{:else if activeView === 'jobs'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Job Management</h3>
				<p class="text-gray-600">
					Create and manage your job postings, edit requirements, and track job performance.
				</p>
			</div>
		{:else if activeView === 'applications'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Application Review</h3>
				<p class="text-gray-600">
					Review candidate applications, filter by criteria, and manage your hiring pipeline.
				</p>
			</div>
		{:else if activeView === 'messages'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Messages</h3>
				<p class="text-gray-600">
					Communicate with candidates, send updates, and manage all your conversations.
				</p>
			</div>
		{:else if activeView === 'interviews'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Interview Scheduling</h3>
				<p class="text-gray-600">
					Schedule interviews, manage calendar, and track interview outcomes.
				</p>
			</div>
		{:else if activeView === 'company-profile'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Company Profile</h3>
				<p class="text-gray-600">
					Update your company information, branding, and public profile details.
				</p>
			</div>
		{:else if activeView === 'settings'}
			<div class="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
				<h3 class="font-semibent mb-4 text-lg">Settings</h3>
				<p class="text-gray-600">Manage account settings, notifications, and system preferences.</p>
			</div>
		{/if}
	</main>
</div>
