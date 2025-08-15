<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { X, FileText } from '@lucide/svelte';

	interface Suggestion {
		name: string;
		email?: string;
		company?: string;
	}

	interface SendMessageData {
		recipient: string;
		subject: string;
		content: string;
		contextType: string;
		contextId: string | null;
		priority: string;
		files: File[];
	}

	const dispatch = createEventDispatcher<{
		close: void;
		send: SendMessageData;
	}>();

	let recipient = $state('');
	let subject = $state('');
	let content = $state('');
	let contextType = $state('general');
	let contextId = $state('');
	let priority = $state('normal');
	let selectedFiles = $state<File[]>([]);
	let fileInput = $state<HTMLInputElement>();
	let recipientSuggestions = $state<Suggestion[]>([]);
	let showSuggestions = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | undefined = $state();

	// Generate unique IDs for accessibility
	const suggestionListId = `suggestions-${Math.random().toString(36).substr(2, 9)}`;

	onMount(() => {
		// Prevent body scroll when modal opens
		document.body.style.overflow = 'hidden';

		// Focus on recipient field when modal opens
		document.querySelector<HTMLInputElement>('.recipient-input')?.focus();
	});

	onDestroy(() => {
		// Restore body scroll when modal closes
		document.body.style.overflow = '';
	});

	function closeModal(): void {
		// Restore body scroll before closing
		document.body.style.overflow = '';
		dispatch('close');
	}

	function sendMessage(): void {
		if (!recipient.trim() || !content.trim()) {
			return;
		}

		dispatch('send', {
			recipient: recipient.trim(),
			subject: subject.trim() || 'New Message',
			content: content.trim(),
			contextType,
			contextId: contextId.trim() || null,
			priority,
			files: selectedFiles
		});
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	function handleOverlayClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}

	function handleOverlayKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			if (event.target === event.currentTarget) {
				closeModal();
			}
		}
	}

	function searchRecipients(): void {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		if (recipient.length < 2) {
			showSuggestions = false;
			return;
		}

		searchTimeout = setTimeout(async () => {
			try {
				const response = await fetch(
					`/api/messages/search-recipients?q=${encodeURIComponent(recipient)}`
				);
				if (response.ok) {
					const data = await response.json();
					recipientSuggestions = data.recipients || [];
					showSuggestions = recipientSuggestions.length > 0;
				}
			} catch (err) {
				console.error('Failed to search recipients:', err);
			}
		}, 300);
	}

	function selectRecipient(suggestion: Suggestion): void {
		recipient = suggestion.email || suggestion.name;
		showSuggestions = false;
		document.querySelector<HTMLInputElement>('.subject-input')?.focus();
	}

	function handleSuggestionKeyDown(event: KeyboardEvent, suggestion: Suggestion): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectRecipient(suggestion);
		}
	}

	function handleFileSelect(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const files = Array.from(target.files);
			selectedFiles = [...selectedFiles, ...files];
		}
	}

	function removeFile(index: number): void {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	function handleFileInputTrigger(): void {
		fileInput?.click();
	}

	function handleFileInputKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleFileInputTrigger();
		}
	}

	function getContextLabel(type: string): string {
		switch (type) {
			case 'application':
				return 'Job Application';
			case 'job_inquiry':
				return 'Job Inquiry';
			case 'general':
				return 'General Discussion';
			case 'system':
				return 'System Message';
			default:
				return type;
		}
	}

	// Computed values using derived state
	const isFormValid = $derived(recipient.trim() && content.trim());
	const contextLabel = $derived(() => {
		if (contextType === 'application') return 'Application ID:';
		if (contextType === 'job_inquiry') return 'Job ID:';
		return 'Context ID:';
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center
	bg-black/50 p-5"
	onclick={handleOverlayClick}
	onkeydown={handleOverlayKeyDown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<div
		class="flex max-h-[700px] w-full max-w-xl flex-col overflow-hidden rounded-[15px] border border-[#EAE9E9] bg-white"
	>
		<!-- Fixed Header -->
		<div class="flex shrink-0 items-center justify-between border-b border-[#EAE9E9] p-4.5">
			<h2 id="modal-title" class="m-0 text-xl font-semibold">New Message</h2>
			<button
				onclick={closeModal}
				class="cursor-pointer text-[#7A7A73] transition-all duration-300 hover:text-[#57564F] focus:outline-none"
				aria-label="Close modal"
			>
				<X size="20" />
			</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<div class="flex-1 overflow-y-auto p-4.5">
				<form
					class="space-y-3"
					onsubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
				>
					<!-- Recipient Field -->
					<div class="relative">
						<input
							type="text"
							id="recipient"
							class="recipient-input w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
							bind:value={recipient}
							oninput={searchRecipients}
							placeholder="Enter recipient name or email.."
							required
							aria-expanded={showSuggestions}
							aria-haspopup="listbox"
							aria-controls={suggestionListId}
							role="combobox"
						/>

						{#if showSuggestions}
							<div
								id={suggestionListId}
								class="absolute top-full right-0 left-0 z-10 max-h-48 overflow-y-auto rounded-b-md border border-t-0 border-gray-300 bg-white shadow-lg"
								role="listbox"
								aria-label="Recipient suggestions"
							>
								{#each recipientSuggestions as suggestion, index}
									<div
										class="cursor-pointer border-b border-gray-50 px-3 py-3 transition-colors last:border-b-0 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
										onclick={() => selectRecipient(suggestion)}
										onkeydown={(e) => handleSuggestionKeyDown(e, suggestion)}
										role="option"
										aria-selected="false"
										tabindex="0"
									>
										<div class="mb-0.5 font-medium text-gray-800">{suggestion.name}</div>
										{#if suggestion.email}
											<div class="text-xs text-gray-500">{suggestion.email}</div>
										{/if}
										{#if suggestion.company}
											<div class="text-xs text-gray-400 italic">{suggestion.company}</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Subject Field -->
					<input
						type="text"
						id="subject"
						class="subject-input w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						bind:value={subject}
						placeholder="Message subject..."
					/>

					<!-- Message Type and Context -->
					<div class="grid gap-3 md:grid-cols-2">
						<select
							id="contextType"
							bind:value={contextType}
							class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						>
							<option value="general">General Discussion</option>
							<option value="application">Job Application</option>
							<option value="job_inquiry">Job Inquiry</option>
							<option value="system">System Message</option>
						</select>

						<select
							id="priority"
							bind:value={priority}
							class="w-full rounded-[12px] border border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						>
							<option value="normal">Normal</option>
							<option value="high">High</option>
							<option value="urgent">Urgent</option>
						</select>
					</div>

					<!-- Context ID (optional) -->
					{#if contextType !== 'general'}
						<input
							type="text"
							id="contextId"
							bind:value={contextId}
							placeholder="Optional - related record ID"
							class="w-full resize-none rounded-[12px] border
							border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
						/>
					{/if}

					<!-- Message Content -->
					<textarea
						id="content"
						bind:value={content}
						placeholder="Type your message here..."
						rows="4"
						required
						class="w-full resize-none rounded-[12px] border
							border-[#D4D7DD] bg-[#e8e8e8] px-4.5 py-1.5 placeholder:text-[#57564F] focus:outline-none"
					></textarea>

					<!-- File Attachments -->
					<div class="space-y-3">
						<!-- Hidden file input -->
						<input
							type="file"
							bind:this={fileInput}
							onchange={handleFileSelect}
							multiple
							accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
							class="hidden"
							aria-hidden="true"
						/>

						<!-- File upload area -->
						<div
							class="relative cursor-pointer rounded-[12px] border border-dashed border-[#D4D7DD] p-4.5 text-center transition-all duration-300 hover:border-[#dddcdc] hover:bg-[#f2f2f2]"
							onclick={handleFileInputTrigger}
							onkeydown={handleFileInputKeyDown}
							role="button"
							tabindex="0"
							aria-label="Click to upload files"
						>
							<div class="flex flex-col items-center space-y-3">
								<div
									class="flex items-center justify-center rounded-full bg-[#e8e8e8] p-3 transition-colors duration-300 group-hover:bg-[#D4D7DD]"
								>
									<svg
										class="h-4.5 w-4.5 text-[#57564F]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-[#57564F]">Click to upload or drag and drop</p>
									<p class="mt-1 text-xs text-[#7A7A73]">PDF, DOC, DOCX (Max 10MB)</p>
								</div>
							</div>
						</div>

						<!-- Selected files display -->
						{#if selectedFiles.length > 0}
							<div class="space-y-2">
								{#each selectedFiles as file, index}
									<div
										class="flex items-center gap-3 rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5"
									>
										<FileText size="18" class="text-[#7A7A73]" />
										<span class="flex-1 text-sm">{file.name}</span>
										<span class="text-xs text-[#57564F]">({Math.round(file.size / 1024)}KB)</span>
										<button
											type="button"
											class="flex cursor-pointer rounded border-none bg-none p-0 text-base text-[#57564F] transition-all duration-300 hover:text-[#212121] focus:outline-none"
											onclick={() => removeFile(index)}
											aria-label={`Remove ${file.name}`}
										>
											×
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</form>
			</div>

			<!-- Fixed Action Buttons at Bottom -->
			<div class="shrink-0 p-4.5 pt-0">
				<div class="flex gap-3">
					<button
						type="button"
						class="cursor-pointer rounded-[12px] border border-[#EAE9E9] px-4.5 py-1.5 text-center transition-colors duration-300 hover:bg-[#EAE9E9] focus:outline-none"
						onclick={closeModal}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 cursor-pointer rounded-[12px] border border-[#323232] bg-[#212121] px-4.5 py-1.5 text-center text-[#F6F6F6] transition-colors duration-300 hover:bg-[#323232] focus:outline-none"
						disabled={!isFormValid}
						onclick={(e) => {
							e.preventDefault();
							sendMessage();
						}}
					>
						Send Message
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
