<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import MessageThread from './MessageThread.svelte';
	import MessageComposer from './MessageComposer.svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { get } from 'svelte/store';
	import { ChevronDown } from '@lucide/svelte';

	type SendMessageData = {
		content: string;
		threadId?: string | null;
		recipient?: string;
		subject?: string;
		contextType?: string;
		contextId?: string | null;
		priority?: string;
		files?: File[];
	};

	// Svelte 5 runes syntax
	let threads = $state<any[]>([]);
	let selectedThreadId = $state<string | null>(null);
	let selectedThread = $state<any>(null);
	let messages = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let showComposer = $state(false);

	let filterType = $state<'all' | 'unread' | 'archived'>('all');
	let contextFilter = $state<'all' | 'application' | 'job_inquiry' | 'general' | 'system'>('all');

	// Mobile state management
	let showThreadList = $state(true); // Show thread list by default on mobile

	// Custom dropdown states
	let showFilterDropdown = $state(false);
	let showContextDropdown = $state(false);

	onMount(async () => {
		await loadThreads();
		const threadId = get(page).url.searchParams.get('thread');
		if (threadId) {
			await selectThread(threadId);
		}
	});

	async function loadThreads() {
		try {
			loading = true;
			const params = new URLSearchParams({
				filter: filterType,
				context: contextFilter,
				search: searchQuery
			});
			const res = await fetch(`/api/messages/threads?${params}`);
			if (!res.ok) throw new Error('Failed to load threads');
			const data = await res.json();
			threads = data.threads || [];
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function selectThread(threadId: string) {
		try {
			selectedThreadId = threadId;
			const url = new URL(window.location.href);
			url.searchParams.set('thread', threadId);
			window.history.replaceState({}, '', url);

			selectedThread = threads.find((t) => t.id === threadId);

			const res = await fetch(`/api/messages/threads/${threadId}/messages`);
			if (!res.ok) throw new Error('Failed to load messages');
			const data = await res.json();
			messages = data.messages || [];

			if (selectedThread?.unreadByUser > 0) {
				await markThreadAsRead(threadId);
			}

			// On mobile, switch to thread view when a thread is selected
			showThreadList = false;
		} catch (err: any) {
			error = err.message;
		}
	}

	async function markThreadAsRead(threadId: string) {
		await fetch(`/api/messages/threads/${threadId}/read`, { method: 'POST' });
		threads = threads.map((t) => (t.id === threadId ? { ...t, unreadByUser: 0 } : t));
	}

	async function sendMessage(data: SendMessageData) {
		try {
			const res = await fetch('/api/messages/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: data.content,
					threadId: data.threadId || null,
					recipient: data.threadId ? undefined : data.recipient, // required for new thread
					subject: data.threadId ? null : data.subject || 'New Message',
					contextType: data.contextType || 'general',
					contextId: data.contextId || null,
					priority: data.priority || 'normal',
					files: data.files || []
				})
			});

			const jsonData = await res.json();
			if (!res.ok) throw new Error(jsonData.error || 'Failed to send message');

			if (!data.threadId) {
				await loadThreads();
				await selectThread(jsonData.threadId);
			} else {
				messages = [...messages, jsonData.message];
				await loadThreads();
			}
		} catch (err: any) {
			error = err.message;
		}
	}

	async function archiveThread(threadId: string) {
		await fetch(`/api/messages/threads/${threadId}/archive`, { method: 'POST' });
		threads = threads.filter((t) => t.id !== threadId);
		if (selectedThreadId === threadId) {
			selectedThreadId = null;
			selectedThread = null;
			messages = [];
			// Return to thread list on mobile after archiving
			showThreadList = true;
		}
	}

	function handleSearch() {
		loadThreads();
	}

	function handleFilterChange() {
		loadThreads();
	}

	// Custom dropdown functions
	function closeAllDropdowns() {
		showFilterDropdown = false;
		showContextDropdown = false;
	}

	function toggleFilterDropdown() {
		showContextDropdown = false;
		showFilterDropdown = !showFilterDropdown;
	}

	function toggleContextDropdown() {
		showFilterDropdown = false;
		showContextDropdown = !showContextDropdown;
	}

	function selectFilterType(type: 'all' | 'unread' | 'archived') {
		filterType = type;
		showFilterDropdown = false;
		handleFilterChange();
	}

	function selectContextFilter(
		context: 'all' | 'application' | 'job_inquiry' | 'general' | 'system'
	) {
		contextFilter = context;
		showContextDropdown = false;
		handleFilterChange();
	}

	function handleClickOutside(event: MouseEvent) {
		// Close dropdowns if clicked outside
		if (
			(showFilterDropdown || showContextDropdown) &&
			!(event.target as Element).closest('.dropdown-container')
		) {
			closeAllDropdowns();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeAllDropdowns();
		}
	}

	// Effect for handling outside clicks and keydown
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

	function getUnreadCount() {
		return threads.reduce((sum, t) => sum + t.unreadByUser, 0);
	}

	function formatLastMessage(thread: any) {
		if (thread.lastMessagePreview) {
			return thread.lastMessagePreview.length > 60
				? thread.lastMessagePreview.substring(0, 60) + '...'
				: thread.lastMessagePreview;
		}
		return 'No messages yet';
	}

	function getContextIcon(type: string) {
		return type === 'application'
			? '📄'
			: type === 'job_inquiry'
				? '💼'
				: type === 'system'
					? '⚙️'
					: '💬';
	}

	function getContextLabel(context: string) {
		const labels = {
			all: 'All Types',
			application: 'Applications',
			job_inquiry: 'Job Inquiries',
			general: 'General',
			system: 'System'
		};
		return labels[context as keyof typeof labels] || context;
	}

	function getFilterLabel(filter: string) {
		const labels = {
			all: 'All',
			unread: 'Unread',
			archived: 'Archived'
		};
		return labels[filter as keyof typeof labels] || filter;
	}

	function handleThreadClick(threadId: string) {
		selectThread(threadId);
	}

	function handleThreadKeydown(event: KeyboardEvent, threadId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectThread(threadId);
		}
	}

	function dismissError() {
		error = null;
	}

	function handleErrorKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			dismissError();
		}
	}

	function openComposer() {
		showComposer = true;
	}

	function closeComposer() {
		showComposer = false;
	}

	function handleSendMessage(event: CustomEvent<SendMessageData>) {
		sendMessage({
			...event.detail,
			threadId: null // explicitly mark as new thread
		});
		closeComposer();
	}

	function handleSendReply(event: CustomEvent<SendMessageData>) {
		if (!selectedThreadId) return;
		sendMessage({
			content: event.detail.content,
			threadId: selectedThreadId
		});
	}

	function handleArchiveThread() {
		if (selectedThreadId) {
			archiveThread(selectedThreadId);
		}
	}

	// Mobile navigation functions
	function goBackToThreadList() {
		showThreadList = true;
		// Optionally clear selection on mobile
		// selectedThreadId = null;
		// selectedThread = null;
		// messages = [];
	}
</script>

<div class="flex h-full flex-col rounded-[15px] border border-[#EAE9E9]">
	<!-- Error message (if needed) -->
	<!-- {#if error}
		<div
			class="justify-between border
			border-red-200 bg-red-100 px-4 py-2 text-red-700"
			role="alert"
			aria-live="polite"
		>
			<span class="text-sm">⚠️ {error}</span>
			<button
				onclick={dismissError}
				onkeydown={handleErrorKeydown}
				class="rounded px-1 text-lg hover:bg-red-200"
				aria-label="Dismiss error message"
				type="button"
			>
				×
			</button>
		</div>
	{/if} -->

	<div class="flex flex-1 overflow-hidden rounded-[15px]">
		<!-- Thread List Sidebar - Always visible on desktop, conditionally on mobile -->
		<aside
			class={`flex flex-col border-r border-[#EAE9E9] bg-white xl:w-1/4 ${
				showThreadList ? 'w-full xl:flex' : 'hidden xl:flex'
			}`}
			aria-label="Message threads"
		>
			<header class="flex items-center justify-between border-b border-[#EAE9E9] p-4.5">
				<h2 class="flex items-center font-semibold">
					Messages
					{#if getUnreadCount() > 0}
						<span class="">
							({getUnreadCount()} unread)
						</span>
					{/if}
				</h2>
			</header>

			<!-- Filters and Search -->
			<div class="space-y-3 border-b border-[#EAE9E9] p-4.5">
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<!-- Custom Filter Type Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleFilterDropdown}
							class="flex w-full items-center justify-between rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 text-sm focus:outline-none"
							aria-label="Filter threads by type"
						>
							<span>{getFilterLabel(filterType)}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {showFilterDropdown ? 'rotate-180' : ''}"
							/>
						</button>
						{#if showFilterDropdown}
							<div
								class="absolute top-full left-0 z-10 mt-1 w-full space-y-1 rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm"
								role="menu"
								aria-orientation="vertical"
							>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {filterType ===
									'all'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectFilterType('all')}
									role="menuitem"
								>
									<span>All</span>
									{#if filterType === 'all'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {filterType ===
									'unread'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectFilterType('unread')}
									role="menuitem"
								>
									<span>Unread</span>
									{#if filterType === 'unread'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {filterType ===
									'archived'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectFilterType('archived')}
									role="menuitem"
								>
									<span>Archived</span>
									{#if filterType === 'archived'}
										<span>✓</span>
									{/if}
								</button>
							</div>
						{/if}
					</div>

					<!-- Custom Context Filter Dropdown -->
					<div class="dropdown-container relative">
						<button
							onclick={toggleContextDropdown}
							class="flex w-full items-center justify-between rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 text-sm focus:outline-none"
							aria-label="Filter threads by context"
						>
							<span>{getContextLabel(contextFilter)}</span>
							<ChevronDown
								size="14"
								class="transition-transform duration-300 {showContextDropdown ? 'rotate-180' : ''}"
							/>
						</button>
						{#if showContextDropdown}
							<div
								class="absolute top-full left-0 z-10 mt-1 w-full space-y-1 rounded-[12px] border border-[#EAE9E9] bg-white p-1 shadow-sm"
								role="menu"
								aria-orientation="vertical"
							>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {contextFilter ===
									'all'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectContextFilter('all')}
									role="menuitem"
								>
									<span>All Types</span>
									{#if contextFilter === 'all'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {contextFilter ===
									'application'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectContextFilter('application')}
									role="menuitem"
								>
									<span>Applications</span>
									{#if contextFilter === 'application'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {contextFilter ===
									'job_inquiry'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectContextFilter('job_inquiry')}
									role="menuitem"
								>
									<span>Job Inquiries</span>
									{#if contextFilter === 'job_inquiry'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {contextFilter ===
									'general'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectContextFilter('general')}
									role="menuitem"
								>
									<span>General</span>
									{#if contextFilter === 'general'}
										<span>✓</span>
									{/if}
								</button>
								<button
									class="flex w-full cursor-pointer items-center justify-between rounded-[9px] px-3 py-1 text-left text-sm {contextFilter ===
									'system'
										? 'bg-[#EAE9E9]'
										: 'hover:bg-[#f6f6f6]'}"
									onclick={() => selectContextFilter('system')}
									role="menuitem"
								>
									<span>System</span>
									{#if contextFilter === 'system'}
										<span>✓</span>
									{/if}
								</button>
							</div>
						{/if}
					</div>
				</div>
				<input
					type="text"
					placeholder="Search messages..."
					bind:value={searchQuery}
					oninput={handleSearch}
					class="w-full rounded-[12px] border border-[#D4D7DD]
						bg-[#e8e8e8] px-4.5 py-1.5 text-sm placeholder:text-[#57564F] focus:outline-none"
					aria-label="Search messages"
				/>
			</div>

			<!-- Thread List -->
			<div class="flex-1 overflow-y-auto" role="list" aria-label="Message threads list">
				{#if loading}
					<div class="p-6 text-center text-[#57564F]" role="status" aria-live="polite">
						Loading threads...
					</div>
				{:else if threads.length === 0}
					<div class="space-y-3 p-6 text-center text-[#57564F]">
						<p>No messages yet</p>
						<button
							onclick={openComposer}
							class="cursor-pointer rounded-[9px] border border-[#323232] bg-[#212121] px-3 py-1 text-center text-sm text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
							type="button"
						>
							Send your first message
						</button>
					</div>
				{:else}
					{#each threads as thread (thread.id)}
						<div
							class={`relative cursor-pointer border-b border-gray-100 p-3 focus-within:bg-gray-50 hover:bg-gray-50 xl:p-4 ${
								selectedThreadId === thread.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
							} ${thread.unreadByUser > 0 ? 'bg-green-50 font-medium' : ''}`}
							role="listitem"
						>
							<button
								type="button"
								class="w-full rounded text-left focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
								onclick={() => handleThreadClick(thread.id)}
								onkeydown={(e) => handleThreadKeydown(e, thread.id)}
								aria-label="Select thread: {thread.subject || 'No subject'}"
							>
								<div class="mb-1 flex items-start justify-between">
									<div class="flex min-w-0 flex-1 items-center gap-2">
										<span role="img" aria-label="{thread.contextType} thread" class="shrink-0"
											>{getContextIcon(thread.contextType)}</span
										>
										<span class="truncate text-sm font-medium"
											>{thread.subject || 'No subject'}</span
										>
									</div>
									<time class="ml-2 shrink-0 text-xs text-gray-500" datetime={thread.lastMessageAt}>
										{formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
									</time>
								</div>
								<div class="pr-8 text-xs text-gray-600">{formatLastMessage(thread)}</div>
							</button>
							{#if thread.unreadByUser > 0}
								<div
									class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full bg-red-500 px-2 py-0.5 text-xs text-white"
									aria-label="{thread.unreadByUser} unread messages"
								>
									{thread.unreadByUser}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</aside>

		<!-- Main Content Area -->
		<main class={`flex flex-1 flex-col bg-white ${!showThreadList ? 'w-full' : 'hidden xl:flex'}`}>
			{#if selectedThread}
				<div class="flex h-full flex-col">
					<!-- Mobile back button header -->
					<div class="flex items-center border-b border-[#EAE9E9] p-3 xl:hidden">
						<button
							onclick={goBackToThreadList}
							class="mr-3 rounded p-1 hover:bg-gray-100"
							type="button"
							aria-label="Back to thread list"
						>
							← Back
						</button>
						<div class="flex min-w-0 flex-1 items-center gap-2">
							<span role="img" aria-label="{selectedThread.contextType} thread" class="shrink-0">
								{getContextIcon(selectedThread.contextType)}
							</span>
							<h1 class="truncate text-sm font-semibold">
								{selectedThread.subject || 'No subject'}
							</h1>
						</div>
					</div>

					<!-- Message Thread Component -->
					<div class="flex-1">
						<MessageThread
							thread={selectedThread}
							{messages}
							on:sendMessage={handleSendReply}
							on:archiveThread={handleArchiveThread}
						/>
					</div>
				</div>
			{:else}
				<!-- Welcome screen - hidden on mobile when thread list is shown -->
				<div class="flex flex-1 items-center justify-center p-6">
					<div class="space-y-6 text-center">
						<div>
							<h3 class="text-lg font-semibold">Welcome to Messages</h3>
							<p class="text-sm text-[#57564F]">Select a conversation or start a new one.</p>
						</div>
						<button
							class="cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232]"
							onclick={openComposer}
							type="button"
						>
							Start New Conversation
						</button>
					</div>
				</div>
			{/if}
		</main>
	</div>

	<!-- Message Composer Modal -->
	{#if showComposer}
		<div
			class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 xl:relative xl:z-auto xl:bg-transparent xl:p-0"
		>
			<div class="w-full max-w-lg xl:max-w-none">
				<MessageComposer on:send={handleSendMessage} on:close={closeComposer} />
			</div>
		</div>
	{/if}
</div>
