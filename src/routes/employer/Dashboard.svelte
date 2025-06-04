<script lang="ts">
	import {
		TrendingUp,
		Briefcase,
		Settings,
		LayoutDashboard,
		Plus,
		Search,
		MessageCircle
	} from '@lucide/svelte';

	const { employer } = $props();

	type ViewKey = 'dashboard' | 'jobs' | 'messages' | 'settings';
	let activeView = $state<ViewKey>('dashboard');
	let searchQuery = $state('');

	const navItems: { label: string; view: ViewKey; icon: typeof LayoutDashboard }[] = [
		{ label: 'Dashboard', view: 'dashboard', icon: TrendingUp },
		{ label: 'Jobs', view: 'jobs', icon: Briefcase },
		{ label: 'Messages', view: 'messages', icon: MessageCircle },
		{ label: 'Settings', view: 'settings', icon: Settings }
	];

	const viewContent: Record<ViewKey, string> = {
		dashboard: 'Dashboard Overview',
		jobs: 'Manage Job Postings',
		messages: 'Your Messages',
		settings: 'Account Settings'
	};
</script>

<div class="flex min-h-screen w-full bg-gray-50 text-[#343131]">
	<!-- Sidebar -->
	<aside class="hidden w-80 flex-col space-y-4 bg-[#343131] p-4 text-white md:flex">
		<div>
			<h1 class="text-2xl font-bold">{employer.companyName}</h1>
			<p class="text-gray-400">Employer dashboard</p>
		</div>

		<nav class="space-y-4">
			{#each navItems as { label, view, icon: Icon }}
				<button
					onclick={() => (activeView = view)}
					class="flex w-full items-center gap-4 rounded-[8px] p-2 px-4 transition-colors"
					class:bg-[#706D54]={activeView === view}
					class:hover:bg-[#706D54]={activeView !== view}
				>
					<Icon size="18" />
					<span>{label}</span>
				</button>
			{/each}
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 space-y-6 p-4">
		<div class="flex flex-col gap-4 md:flex-row md:justify-between">
			<h2 class="text-3xl font-bold">{navItems.find((i) => i.view === activeView)?.label}</h2>
			<div class="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
				<a
					href="/post-job"
					class="flex items-center gap-2 rounded-[8px] bg-[#343131] px-4 py-2 text-white transition-colors duration-200"
				>
					<Plus size="16" />
					Post Job
				</a>
				<div
					class="flex items-center gap-4 rounded-[8px] border-2 border-[#343131] bg-white px-4 py-2 md:w-60"
				>
					<Search size="16" class="text-[#343131]" />
					<input
						type="text"
						placeholder="Find Candidates"
						class="w-full text-sm focus:outline-none"
						bind:value={searchQuery}
					/>
				</div>
			</div>
		</div>

		<p class="text-gray-600">{viewContent[activeView]}</p>

		<!-- View-specific content -->
		{#if activeView === 'dashboard'}
			<!-- Dashboard content here -->
		{:else if activeView === 'jobs'}
			<!-- Jobs content here -->
		{:else if activeView === 'messages'}
			<!-- Messages content here -->
		{:else if activeView === 'settings'}
			<!-- Settings content here -->
		{/if}
	</main>
</div>
