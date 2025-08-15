import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Message store
export const messageStore = writable({
	threads: [],
	selectedThread: null,
	messages: [],
	unreadCount: 0,
	loading: false,
	error: null
});

// Derived stores
export const unreadCount = derived(messageStore, ($store) =>
	$store.threads.reduce((sum, thread) => sum + thread.unreadByUser, 0)
);

export const hasUnreadMessages = derived(unreadCount, (count) => count > 0);

// Message event handlers
export class MessageHandler {
	constructor() {
		this.eventSource = null;
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
	}

	// Initialize real-time message listening
	async startListening(userId) {
		if (!browser || !userId) return;

		try {
			// Close existing connection
			this.stopListening();

			// Create EventSource for real-time updates
			this.eventSource = new EventSource(`/api/messages/stream?userId=${userId}`);

			this.eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data);
				this.handleMessageEvent(data);
			};

			this.eventSource.onerror = (error) => {
				console.error('Message stream error:', error);
				this.handleConnectionError();
			};

			this.eventSource.onopen = () => {
				console.log('Message stream connected');
				this.reconnectAttempts = 0;
			};
		} catch (error) {
			console.error('Failed to start message listening:', error);
		}
	}

	stopListening() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}
	}

	handleConnectionError() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

			setTimeout(() => {
				console.log(
					`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
				);
				this.startListening();
			}, delay);
		}
	}

	handleMessageEvent(data) {
		messageStore.update((store) => {
			switch (data.type) {
				case 'new_message':
					return this.handleNewMessage(store, data);
				case 'message_read':
					return this.handleMessageRead(store, data);
				case 'thread_updated':
					return this.handleThreadUpdated(store, data);
				default:
					return store;
			}
		});
	}

	handleNewMessage(store, data) {
		const { message: newMessage, thread } = data;

		// Update or add thread
		const threadIndex = store.threads.findIndex((t) => t.id === thread.id);
		if (threadIndex >= 0) {
			store.threads[threadIndex] = thread;
		} else {
			store.threads.unshift(thread);
		}

		// Add message if viewing this thread
		if (store.selectedThread?.id === newMessage.threadId) {
			store.messages.push(newMessage);
		}

		// Play notification sound
		this.playNotificationSound();

		return {
			...store,
			threads: [...store.threads]
		};
	}

	handleMessageRead(store, data) {
		const { threadId, messageIds } = data;

		// Update thread unread count
		const threadIndex = store.threads.findIndex((t) => t.id === threadId);
		if (threadIndex >= 0) {
			store.threads[threadIndex].unreadByUser = 0;
		}

		// Update message read status
		store.messages = store.messages.map((msg) =>
			messageIds.includes(msg.id) ? { ...msg, isRead: true, readAt: new Date() } : msg
		);

		return {
			...store,
			threads: [...store.threads],
			messages: [...store.messages]
		};
	}

	handleThreadUpdated(store, data) {
		const { thread } = data;

		const threadIndex = store.threads.findIndex((t) => t.id === thread.id);
		if (threadIndex >= 0) {
			store.threads[threadIndex] = thread;
		}

		if (store.selectedThread?.id === thread.id) {
			store.selectedThread = thread;
		}

		return {
			...store,
			threads: [...store.threads],
			selectedThread: store.selectedThread
		};
	}

	playNotificationSound() {
		try {
			const audio = new Audio('/sounds/notification.mp3');
			audio.volume = 0.3;
			audio.play().catch((e) => console.log('Could not play notification sound'));
		} catch (error) {
			// Silently fail if audio not available
		}
	}
}

// Message formatting utilities
export function formatMessageTime(timestamp) {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInMs = now - date;
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 1) return 'Just now';
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
	if (diffInHours < 24) return `${diffInHours}h ago`;
	if (diffInDays < 7) return `${diffInDays}d ago`;

	return date.toLocaleDateString();
}

export function formatMessagePreview(content, maxLength = 100) {
	if (!content) return 'No content';

	const cleaned = content.replace(/\s+/g, ' ').trim();
	return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
}

export function getMessageStatusIcon(message) {
	if (message.deliveryStatus === 'failed') return '❌';
	if (message.isRead) return '✓✓';
	if (message.deliveryStatus === 'delivered') return '✓';
	return '🕐';
}

export function getPriorityColor(priority) {
	switch (priority) {
		case 'urgent':
			return '#e53e3e';
		case 'high':
			return '#f56500';
		case 'normal':
			return '#4a5568';
		case 'low':
			return '#718096';
		default:
			return '#4a5568';
	}
}

// Template processing
export function processMessageTemplate(template, variables = {}) {
	let content = template.content;
	let subject = template.subject || '';

	// Replace variables in format {{variableName}}
	Object.entries(variables).forEach(([key, value]) => {
		const regex = new RegExp(`{{${key}}}`, 'g');
		content = content.replace(regex, String(value));
		subject = subject.replace(regex, String(value));
	});

	return {
		subject: subject || template.templateName,
		content,
		templateId: template.id,
		templateVariables: variables
	};
}

// Message validation
export function validateMessage(messageData) {
	const errors = [];

	if (!messageData.content || !messageData.content.trim()) {
		errors.push('Message content is required');
	}

	if (messageData.content && messageData.content.length > 10000) {
		errors.push('Message content is too long (max 10,000 characters)');
	}

	if (messageData.subject && messageData.subject.length > 255) {
		errors.push('Subject is too long (max 255 characters)');
	}

	if (!messageData.threadId && !messageData.recipient) {
		errors.push('Recipient is required for new messages');
	}

	if (messageData.files && messageData.files.length > 10) {
		errors.push('Too many attachments (max 10 files)');
	}

	if (messageData.files) {
		const totalSize = messageData.files.reduce((sum, file) => sum + file.size, 0);
		const maxSize = 50 * 1024 * 1024; // 50MB total
		if (totalSize > maxSize) {
			errors.push('Attachments too large (max 50MB total)');
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

// File upload utilities
export function validateFile(file) {
	const allowedTypes = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'text/plain',
		'image/jpeg',
		'image/png',
		'image/gif'
	];

	const maxFileSize = 10 * 1024 * 1024; // 10MB per file

	if (!allowedTypes.includes(file.type)) {
		return { isValid: false, error: 'File type not allowed' };
	}

	if (file.size > maxFileSize) {
		return { isValid: false, error: 'File too large (max 10MB)' };
	}

	return { isValid: true };
}

export function getFileIcon(mimeType) {
	if (mimeType.startsWith('image/')) return '🖼️';
	if (mimeType === 'application/pdf') return '📄';
	if (mimeType.includes('word')) return '📝';
	if (mimeType === 'text/plain') return '📃';
	return '📎';
}

// Search and filtering
export function filterMessages(messages, filters = {}) {
	let filtered = [...messages];

	if (filters.search) {
		const searchLower = filters.search.toLowerCase();
		filtered = filtered.filter(
			(msg) =>
				msg.content.toLowerCase().includes(searchLower) ||
				(msg.subject && msg.subject.toLowerCase().includes(searchLower))
		);
	}

	if (filters.priority && filters.priority !== 'all') {
		filtered = filtered.filter((msg) => msg.priority === filters.priority);
	}

	if (filters.dateFrom) {
		const fromDate = new Date(filters.dateFrom);
		filtered = filtered.filter((msg) => new Date(msg.sentAt) >= fromDate);
	}

	if (filters.dateTo) {
		const toDate = new Date(filters.dateTo);
		filtered = filtered.filter((msg) => new Date(msg.sentAt) <= toDate);
	}

	if (filters.senderType) {
		if (filters.senderType === 'user') {
			filtered = filtered.filter((msg) => msg.senderUserId);
		} else if (filters.senderType === 'employer') {
			filtered = filtered.filter((msg) => msg.senderEmployerId);
		} else if (filters.senderType === 'system') {
			filtered = filtered.filter((msg) => msg.isSystemMessage);
		}
	}

	return filtered;
}

// Export/Import utilities
export function exportMessagesToCSV(messages) {
	const headers = ['Date', 'Sender', 'Subject', 'Content', 'Priority', 'Status'];
	const csvData = [headers];

	messages.forEach((msg) => {
		const row = [
			new Date(msg.sentAt).toLocaleString(),
			msg.senderUserId ? 'You' : msg.isSystemMessage ? 'System' : 'Employer',
			msg.subject || '',
			msg.content.replace(/"/g, '""'), // Escape quotes
			msg.priority || 'normal',
			msg.isRead ? 'Read' : 'Unread'
		];
		csvData.push(row);
	});

	const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

	// Create download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);
	link.setAttribute('href', url);
	link.setAttribute('download', `messages_${new Date().toISOString().split('T')[0]}.csv`);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// Local storage for draft messages
export const draftStore = {
	save(threadId, content) {
		if (!browser) return;
		try {
			const drafts = JSON.parse(localStorage.getItem('message_drafts') || '{}');
			drafts[threadId || 'new'] = {
				content,
				timestamp: Date.now()
			};
			localStorage.setItem('message_drafts', JSON.stringify(drafts));
		} catch (error) {
			console.error('Failed to save draft:', error);
		}
	},

	load(threadId) {
		if (!browser) return null;
		try {
			const drafts = JSON.parse(localStorage.getItem('message_drafts') || '{}');
			const draft = drafts[threadId || 'new'];

			// Return draft if it's less than 24 hours old
			if (draft && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
				return draft.content;
			}

			// Clean up old draft
			if (draft) {
				this.remove(threadId);
			}

			return null;
		} catch (error) {
			console.error('Failed to load draft:', error);
			return null;
		}
	},

	remove(threadId) {
		if (!browser) return;
		try {
			const drafts = JSON.parse(localStorage.getItem('message_drafts') || '{}');
			delete drafts[threadId || 'new'];
			localStorage.setItem('message_drafts', JSON.stringify(drafts));
		} catch (error) {
			console.error('Failed to remove draft:', error);
		}
	}
};

// Global message handler instance
export const messageHandler = new MessageHandler();  fix this