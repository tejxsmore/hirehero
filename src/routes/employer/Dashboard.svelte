<script lang="ts">
	import {
		TrendingUp,
		Briefcase,
		Users,
		Building,
		Settings,
		Calendar,
		LayoutDashboard,
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
	let isDropdownOpen = $state(false);

	const navItems: { label: string; view: ViewKey; icon: typeof LayoutDashboard }[] = [
		{ label: 'Dashboard', view: 'dashboard', icon: TrendingUp },
		{ label: 'Jobs', view: 'jobs', icon: Briefcase },
		{ label: 'Applications', view: 'applications', icon: Users },
		{ label: 'Messages', view: 'messages', icon: MessageCircle },
		{ label: 'Interviews', view: 'interviews', icon: Calendar },
		{ label: 'Company Profile', view: 'company-profile', icon: Building },
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
	<aside class="hidden w-72 flex-col space-y-5 border-r border-[#EAE9E9] p-5 md:flex">
		<nav class="space-y-3">
			{#each navItems as { label, view, icon: Icon }}
				<button
					onclick={() => (activeView = view)}
					class="flex w-full cursor-pointer items-center gap-5 rounded-[12px] px-4.5 py-1.5 transition-colors
					{activeView === view ? 'bg-[#EAE9E9] ' : ' hover:bg-[#EAE9E9]'}"
				>
					<Icon size="14" />
					<span>{label}</span>
				</button>
			{/each}
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 space-y-4.5 p-4.5">
		<div class="block md:hidden">
			<!-- Advanced Custom Dropdown -->
			<div class="dropdown-container relative">
				<button
					onclick={toggleDropdown}
					class="flex w-full cursor-pointer items-center justify-between
					rounded-[12px] border border-[#D4D7DD] bg-[#EAE9E9]
					px-4.5 py-1.5"
					aria-expanded={isDropdownOpen}
					aria-haspopup="listbox"
				>
					<div class="flex items-center gap-4.5">
						{#if currentItem}
							<div class="">
								<currentItem.icon size="14" />
							</div>
							<span class="">{currentItem.label}</span>
						{/if}
					</div>
					<ChevronDown
						size="14"
						class="transition-transform duration-300 {isDropdownOpen ? 'rotate-180 ' : ''}"
					/>
				</button>

				{#if isDropdownOpen}
					<div
						class="animate-in slide-in-from-top-2 fade-in absolute top-full right-0 left-0 z-20 mt-1.5 space-y-1 overflow-hidden rounded-[15px] border border-[#D4D7DD] bg-[#EAE9E9] p-1"
						role="listbox"
					>
						{#each navItems as { label, view, icon: Icon }, index}
							<button
								onclick={() => selectView(view)}
								class="flex w-full cursor-pointer items-center justify-between rounded-[12px] px-4.5 py-1.5 transition-all duration-300 hover:bg-[#DDDDDD] focus:outline-none
								{activeView === view ? 'bg-[#DDDDDD]' : ''}"
								role="option"
								aria-selected={activeView === view}
							>
								<div class="flex items-center gap-4.5">
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
			<div class="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
				<div
					class="space-y-1.5 rounded-[15px]
				border border-[#EAE9E9] bg-white p-4.5"
				>
					<p class="flex justify-between gap-3">
						Active Jobs
						<span
							class="rounded-[9px] bg-[#f6f6f6] p-2
						text-[#57564F]"><Briefcase size="14" class=" " /></span
						>
					</p>
					<div>
						<h2 class="text-3xl font-bold">
							{jobs.length}
						</h2>
						<p class="text-sm text-[#7A7A73]">+2 from last month</p>
					</div>
				</div>
				<div
					class="space-y-1.5 rounded-[15px]
				border border-[#EAE9E9] bg-white p-4.5"
				>
					<p class="flex justify-between gap-3">
						Applications
						<span
							class="rounded-[9px] bg-[#f6f6f6] p-2
						text-[#57564F]"><Users size="14" /></span
						>
					</p>
					<div>
						<h2 class="text-3xl font-bold">
							{jobs.length}
						</h2>
						<p class="text-sm text-[#7A7A73]">+2 from last month</p>
					</div>
				</div>
				<div
					class="space-y-1.5 rounded-[15px]
				border border-[#EAE9E9] bg-white p-4.5"
				>
					<p class="flex justify-between gap-3">
						Profile Views
						<span
							class="rounded-[9px] bg-[#f6f6f6] p-2
						text-[#57564F]"><Eye size="14" /></span
						>
					</p>
					<div>
						<h2 class="text-3xl font-bold">
							{jobs.length}
						</h2>
						<p class="text-sm text-[#7A7A73]">+2 from last month</p>
					</div>
				</div>
				<div
					class="space-y-1.5 rounded-[15px]
				border border-[#EAE9E9] bg-white p-4.5"
				>
					<p class="flex justify-between gap-3">
						Interviews Scheduled
						<span
							class="rounded-[9px] bg-[#f6f6f6] p-2
						text-[#57564F]"><Calendar size="14" /></span
						>
					</p>
					<div>
						<h2 class="text-3xl font-bold">
							{jobs.length}
						</h2>
						<p class="text-sm text-[#7A7A73]">+2 from last month</p>
					</div>
				</div>
			</div>
			<div class="grid gap-4.5 md:grid-cols-2">
				<div
					class="space-y-4.5 rounded-[15px] border border-[#EAE9E9]
				  bg-white p-4.5"
				>
					<div class="flex items-start justify-between">
						<h2 class="text-xl font-semibold">Applications</h2>
						<button
							class="cursor-pointer rounded-[9px] border border-[#EAE9E9] px-3 py-1 text-sm transition-all duration-300 hover:bg-[#EAE9E9]"
							>View</button
						>
					</div>
					{#if application}{/if}
				</div>
				<div
					class="space-y-4.5 rounded-[15px] border border-[#EAE9E9]
				bg-white p-4.5"
				>
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-semibold">Active Job Postings</h2>
						<button
							class="cursor-pointer rounded-[9px] border border-[#EAE9E9] px-3 py-1 text-sm transition-all duration-300 hover:bg-[#EAE9E9]"
							>Manage</button
						>
					</div>
					{#if jobs[0]}
						<div class="space-y-5">
							{#each jobs.filter((job: any) => job.jobStatus === 'published') as job}
								<div class="rounded-[10px] border border-[#EAE9E9] p-5">
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
