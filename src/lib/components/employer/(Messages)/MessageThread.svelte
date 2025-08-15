<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import { formatDistanceToNow, format } from 'date-fns';

	interface Message {
		id: string;
		content: string;
		sentAt: string;
		senderUserId?: string;
		isSystemMessage?: boolean;
		subject?: string;
		attachments?: Array<{
			fileUrl: string;
			originalName: string;
			fileSize: number;
		}>;
		priority?: 'normal' | 'high' | 'urgent';
		isRead?: boolean;
	}

	interface Thread {
		subject?: string;
		contextType: 'application' | 'job_inquiry' | 'system' | 'general';
		contextId?: string;
	}

	interface Props {
		thread: Thread;
		messages?: Message[];
	}

	let { thread, messages = [] }: Props = $props();

	const dispatch = createEventDispatcher();

	let messageInput = $state('');
	let messagesContainer = $state<HTMLElement>();
	let showDropdown = $state(false);
	let fileInput = $state<HTMLInputElement>();
	let selectedFiles = $state<File[]>([]);

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (messagesContainer && messages.length > 0) {
			tick().then(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			});
		}
	});

	function sendMessage() {
		if (messageInput.trim()) {
			dispatch('sendMessage', {
				content: messageInput.trim(),
				files: selectedFiles
			});
			messageInput = '';
			selectedFiles = [];
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function archiveThread() {
		if (confirm('Are you sure you want to archive this conversation?')) {
			dispatch('archiveThread');
		}
	}

	function formatMessageTime(timestamp: string) {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return format(date, 'HH:mm');
		} else if (diffInHours < 168) {
			// 7 days
			return format(date, 'EEE HH:mm');
		} else {
			return format(date, 'MMM d, HH:mm');
		}
	}

	function getMessageSender(message: Message) {
		if (message.isSystemMessage) {
			return 'System';
		}
		return message.senderUserId ? 'You' : 'Employer';
	}

	function isOwnMessage(message: Message) {
		return message.senderUserId && !message.isSystemMessage;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const files = Array.from(target.files);
			selectedFiles = [...selectedFiles, ...files];
		}
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	function getContextTitle() {
		switch (thread.contextType) {
			case 'application':
				return 'Application Discussion';
			case 'job_inquiry':
				return 'Job Inquiry';
			case 'system':
				return 'System Messages';
			default:
				return 'General Discussion';
		}
	}

	function getContextBadgeClasses(contextType: string) {
		const baseClasses = 'px-2 py-1 rounded-xl text-xs font-medium capitalize';

		switch (contextType) {
			case 'application':
				return `${baseClasses} bg-teal-50 text-teal-700`;
			case 'job_inquiry':
				return `${baseClasses} bg-yellow-50 text-yellow-700`;
			case 'system':
				return `${baseClasses} bg-red-50 text-red-700`;
			default:
				return `${baseClasses} bg-gray-100 text-gray-700`;
		}
	}

	function getMessageStatusClasses(message: Message) {
		if (message.isSystemMessage) return 'self-center max-w-[80%]';
		if (message.priority === 'urgent') return 'border-l-4 border-red-500';
		if (message.priority === 'high') return 'border-l-4 border-orange-500';
		return '';
	}

	function getPriorityBadgeClasses(priority: string) {
		const baseClasses = 'px-1.5 py-0.5 rounded text-xs font-bold uppercase';

		switch (priority) {
			case 'high':
				return `${baseClasses} bg-orange-100 text-orange-700`;
			case 'urgent':
				return `${baseClasses} bg-red-100 text-red-700`;
			default:
				return baseClasses;
		}
	}

	// Computed value for send button state
	let canSend = $derived(messageInput.trim().length > 0);
</script>

<div class="flex h-full flex-col bg-white">
	<!-- Thread Header -->
	<div class="relative flex items-start justify-between border-b border-gray-200 p-4">
		<div class="flex-1">
			<h3 class="mb-2 text-lg font-semibold text-gray-800">
				{thread.subject || getContextTitle()}
			</h3>
			<div class="flex items-center gap-3">
				<span class={getContextBadgeClasses(thread.contextType)}>
					{thread.contextType.replace('_', ' ')}
				</span>
				{#if thread.contextId}
					<span class="text-xs text-gray-500">ID: {thread.contextId}</span>
				{/if}
			</div>
		</div>

		<div class="relative">
			<button
				class="rounded p-1 text-lg transition-colors hover:bg-gray-50"
				onclick={() => (showDropdown = !showDropdown)}
			>
				⋯
			</button>

			{#if showDropdown}
				<div
					class="absolute top-full right-0 z-10 mt-1 min-w-[150px] rounded-md border border-gray-200 bg-white shadow-lg"
				>
					<button
						class="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
						onclick={archiveThread}
					>
						Archive Thread
					</button>
					<button
						class="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
					>
						Mark as Important
					</button>
					<button
						class="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
					>
						Export Messages
					</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Messages Area -->
	<div class="flex-1 overflow-y-auto" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="flex h-full items-center justify-center text-gray-500 italic">
				<p>Start the conversation by sending a message below.</p>
			</div>
		{:else}
			<div class="flex flex-col gap-4 p-4">
				{#each messages as message (message.id)}
					<div
						class={`max-w-[70%] ${isOwnMessage(message) ? 'self-end' : 'self-start'} ${getMessageStatusClasses(message)}`}
					>
						<div
							class={`mb-1 rounded-xl p-3 ${
								message.isSystemMessage
									? 'bg-red-50 text-center text-red-800 italic'
									: isOwnMessage(message)
										? 'bg-blue-500 text-white'
										: 'bg-gray-50 text-gray-900'
							} ${getMessageStatusClasses(message)}`}
						>
							{#if message.subject && message.subject !== thread.subject}
								<div class="mb-2 text-sm font-semibold">{message.subject}</div>
							{/if}

							<div class="leading-relaxed whitespace-pre-wrap">
								{message.content}
							</div>

							{#if message.attachments && message.attachments.length > 0}
								<div
									class={`mt-2 border-t pt-2 ${
										isOwnMessage(message) ? 'border-white/30' : 'border-gray-200'
									}`}
								>
									{#each message.attachments as attachment}
										<div class="mb-1 flex items-center gap-1.5 text-xs">
											<span>📎</span>
											<a
												href={attachment.fileUrl}
												download={attachment.originalName}
												class="underline"
											>
												{attachment.originalName}
											</a>
											<span class="opacity-70">
												({Math.round(attachment.fileSize / 1024)}KB)
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class={`flex items-center gap-2 text-xs text-gray-500 ${
								isOwnMessage(message) ? 'justify-end' : 'justify-start'
							} ${message.isSystemMessage ? 'justify-center' : ''}`}
						>
							<span>{getMessageSender(message)}</span>
							<span>{formatMessageTime(message.sentAt)}</span>
							{#if message.priority && message.priority !== 'normal'}
								<span class={getPriorityBadgeClasses(message.priority)}>
									{message.priority}
								</span>
							{/if}
							{#if message.isRead}
								<span class="font-bold text-green-500">✓</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Message Input -->
	<div class="border-t border-gray-200 bg-gray-50">
		{#if selectedFiles.length > 0}
			<div class="flex flex-wrap gap-2 border-b border-gray-200 p-4">
				{#each selectedFiles as file, index}
					<div
						class="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-2 py-1 text-xs"
					>
						<span>📎 {file.name}</span>
						<button
							class="ml-1 text-gray-500 hover:text-gray-700"
							onclick={() => removeFile(index)}
						>
							×
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex items-end gap-3 p-4">
			<div class="flex flex-col gap-1">
				<button
					class="rounded-md border border-gray-300 p-2 text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50"
					onclick={() => fileInput?.click()}
					title="Attach file"
				>
					📎
				</button>

				<input
					type="file"
					bind:this={fileInput}
					onchange={handleFileSelect}
					multiple
					accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
					class="hidden"
				/>
			</div>

			<textarea
				bind:value={messageInput}
				placeholder="Type your message..."
				onkeydown={handleKeyDown}
				rows="1"
				class="font-inherit max-h-[120px] min-h-[40px] flex-1 resize-none rounded-md border border-gray-300 bg-white p-2.5 text-sm leading-relaxed focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			></textarea>

			<button
				class={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
					canSend
						? 'bg-blue-500 text-white hover:bg-blue-600'
						: 'cursor-not-allowed bg-gray-300 text-gray-500'
				}`}
				onclick={sendMessage}
				disabled={!canSend}
			>
				Send
			</button>
		</div>
	</div>
</div>

<!-- Mobile responsive adjustments -->
<style>
	@media (max-width: 768px) {
		.max-w-\[70\%\] {
			max-width: 85%;
		}

		.max-w-\[80\%\] {
			max-width: 95%;
		}
	}
</style>
