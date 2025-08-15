import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { messageThread } from '$lib/db/schema';
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

		// Ensure the thread belongs to the user and archive it
		const updated = await db
			.update(messageThread)
			.set({
				isArchived: true,
				updatedAt: new Date()
			})
			.where(and(eq(messageThread.id, threadId), eq(messageThread.userId, userId)));

		// If no rows were updated, thread wasn't found or didn't belong to the user
		if (updated.rowCount === 0) {
			return json({ error: 'Thread not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error archiving thread:', error);
		return json({ error: 'Failed to archive thread' }, { status: 500 });
	}
}
