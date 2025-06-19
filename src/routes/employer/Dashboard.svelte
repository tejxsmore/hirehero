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
		Check,
		Eye
	} from '@lucide/svelte';
	import SignOutButton from '$lib/components/auth/SignOutButton.svelte';
	import Jobs from './Jobs.svelte';
	import { application } from '$lib/db/schema';

	const { employer, jobs, applications } = $props();

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

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown-container')) {
			isDropdownOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="flex min-h-screen w-full overflow-y-auto">
	<!-- Desktop Sidebar -->
	<aside
		class="hidden w-72 flex-col space-y-5 border-r border-gray-300
	bg-white p-5 md:flex"
	>
		<nav class="space-y-2.5">
			{#each navItems as { label, view, icon: Icon }}
				<button
					onclick={() => (activeView = view)}
					class="flex w-full cursor-pointer items-center gap-5 rounded-[10px] px-5 py-2.5 transition-colors
					{activeView === view ? 'bg-gray-100  text-[#FF4F0F]' : ' hover:bg-gray-100'}"
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
					rounded-[10px] bg-gray-100 px-5 py-2.5 text-[#FF4F0F]
					transition-all duration-200 focus:outline-none"
					aria-expanded={isDropdownOpen}
					aria-haspopup="listbox"
				>
					<div class="flex items-center gap-5">
						{#if currentItem}
							<div class="">
								<currentItem.icon size="16" />
							</div>
							<span class="">{currentItem.label}</span>
						{/if}
					</div>
					<ChevronDown
						size="16"
						class="transition-transform duration-200 {isDropdownOpen ? 'rotate-180 ' : ''}"
					/>
				</button>

				{#if isDropdownOpen}
					<div
						class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-2.5 space-y-1 overflow-hidden rounded-[14px] border border-gray-300 bg-white p-1 duration-200"
						role="listbox"
					>
						{#each navItems as { label, view, icon: Icon }, index}
							<button
								onclick={() => selectView(view)}
								class="flex w-full cursor-pointer items-center justify-between rounded-[10px] px-5 py-2.5 transition-all
								duration-200 hover:bg-gray-100 focus:outline-none
								{activeView === view ? 'bg-gray-100 text-[#FF4F0F]' : ''}"
								role="option"
								aria-selected={activeView === view}
							>
								<div class="flex items-center gap-5">
									<Icon size="14" class="" />
									<span class="flex-1">{label}</span>
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

		<!-- View-specific content -->
		{#if activeView === 'dashboard'}
			<div class="flex justify-between gap-5">
				<h2 class="text-3xl font-bold">Dashboard</h2>
				<div class="flex gap-5">
					<a
						href={`/employer/post-job`}
						class="flex w-full items-center gap-5 rounded-[10px] border border-gray-300 bg-white p-2.5 hover:text-[#FF4F0F]
						sm:px-5"
					>
						<Plus size="16" class="flex-shrink-0" />
						<span class="hidden lg:inline">Post Job</span>
					</a>
					<div
						class="flex w-full items-center gap-5 rounded-[10px] border border-gray-300 bg-gray-200 p-2.5 sm:px-5"
					>
						<Search size="16" class="text-gray-400" />
						<input
							type="text"
							name="search"
							placeholder="Search candidates"
							class=" hidden placeholder:text-gray-400 focus:outline-none sm:inline"
						/>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-5 lg:grid-cols-4">
				<div
					class="rounded-[15px] border
				border-gray-300 bg-white p-5"
				>
					<p class="flex justify-between gap-5">
						Active Jobs
						<span><Briefcase size="16" class="mt-1 text-gray-400" /></span>
					</p>
					<h2 class="pt-5 text-3xl font-bold">
						{jobs.length}
					</h2>
					<p class="text-sm text-gray-400">+2 from last month</p>
				</div>
				<div
					class="rounded-[15px] border
				border-gray-300 bg-white p-5"
				>
					<p class="flex justify-between gap-5">
						Total Applications
						<span><Users size="16" class="mt-1 text-gray-400" /></span>
					</p>
					<h2 class="pt-5 text-3xl font-bold">
						{jobs.length}
					</h2>
					<p class="text-sm text-gray-400">+2 from last month</p>
				</div>
				<div
					class="rounded-[15px] border
				border-gray-300 bg-white p-5"
				>
					<p class="flex justify-between gap-5">
						Profile Views
						<span><Eye size="16" class="mt-1 text-gray-400" /></span>
					</p>
					<h2 class="pt-5 text-3xl font-bold">
						{jobs.length}
					</h2>
					<p class="text-sm text-gray-400">+2 from last month</p>
				</div>
				<div
					class="rounded-[15px] border
				border-gray-300 bg-white p-5"
				>
					<p class="flex justify-between gap-5">
						Interviews Scheduled
						<span><Calendar size="16" class="mt-1 text-gray-400" /></span>
					</p>
					<h2 class="pt-5 text-3xl font-bold">
						{jobs.length}
					</h2>
					<p class="text-sm text-gray-400">+2 from last month</p>
				</div>
			</div>
			<div class="grid gap-5 md:grid-cols-2">
				<div
					class="space-y-5 rounded-[15px] border border-gray-300
				  bg-white p-5"
				>
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Applications</h2>
						<button
							class="cursor-pointer rounded-[10px] border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
							>View</button
						>
					</div>
					{#if application}{/if}
				</div>
				<div
					class="space-y-5 rounded-[15px] border border-gray-300
				bg-white p-5"
				>
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Active Job Postings</h2>
						<button
							class="cursor-pointer rounded-[10px] border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
							>Manage</button
						>
					</div>
					{#if jobs[0]}
						<div class="space-y-5">
							{#each jobs.filter((job: any) => job.jobStatus === 'published') as job}
								<div class="rounded-[10px] border border-gray-300 p-5">
									<h2>{job.title}</h2>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else if activeView === 'jobs'}
			<Jobs {jobs} />
		{:else if activeView === 'applications'}
			<!-- Application content -->
		{:else if activeView === 'messages'}
			<!-- Messages content -->
		{:else if activeView === 'interviews'}
			<!-- Interviews content -->
		{:else if activeView === 'company-profile'}
			<!-- Company profile content -->
		{:else if activeView === 'settings'}
			<div class="space-y-5">
				<h2 class="text-3xl font-bold">Settings</h2>
				<div class="space-y-5">
					<p>Settings content goes here.</p>
					<SignOutButton />
				</div>
			</div>
		{/if}
	</main>
</div>
