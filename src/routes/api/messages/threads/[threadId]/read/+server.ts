import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { messageThread, message } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/auth';

export async function POST({ request, params }) {
	try {
		const { threadId } = params;
		const session = await auth.api.getSession({
			headers: request.headers
		});

		const userId = session?.user.id;

		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Ensure the thread belongs to the user
		const thread = await db
			.select()
			.from(messageThread)
			.where(and(eq(messageThread.id, threadId), eq(messageThread.userId, userId)))
			.limit(1);

		if (!thread.length) {
			return json({ error: 'Thread not found' }, { status: 404 });
		}

		// Mark all unread messages in the thread as read
		await db
			.update(message)
			.set({
				isRead: true,
				readAt: new Date(),
				readBy: 'user'
			})
			.where(and(eq(message.threadId, threadId), eq(message.isRead, false)));

		// Reset unread counter for user
		await db
			.update(messageThread)
			.set({
				unreadByUser: 0,
				updatedAt: new Date()
			})
			.where(and(eq(messageThread.id, threadId), eq(messageThread.userId, userId)));

		return json({ success: true });
	} catch (error) {
		console.error('Error marking thread as read:', error);
		return json({ error: 'Failed to mark as read' }, { status: 500 });
	}
}
