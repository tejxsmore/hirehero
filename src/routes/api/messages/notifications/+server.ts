import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { notificationQueue } from '$lib/db/schema';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		const userId = session?.user.id;

		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			type,
			channel = 'in_app',
			title,
			content,
			messageId,
			threadId,
			scheduledFor,
			metadata = {}
		} = body;

		if (!type || !title || !content) {
			return json({ error: 'Missing required notification fields' }, { status: 400 });
		}

		const notificationId = randomUUID();

		await db.insert(notificationQueue).values({
			id: notificationId,
			userId,
			type,
			channel,
			title,
			content,
			messageId,
			threadId,
			scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
			metadata,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return json({ success: true, notificationId });
	} catch (error) {
		console.error('Error creating notification:', error);
		return json({ error: 'Failed to create notification' }, { status: 500 });
	}
}
