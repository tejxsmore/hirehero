import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { messageThread, message, messageAttachment, employer, user } from '$lib/db/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { auth } from '$lib/auth';

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
			content,
			threadId,
			subject,
			recipient,
			contextType = 'general',
			contextId,
			priority = 'normal',
			files = []
		} = body;

		if (!content?.trim()) {
			return json({ error: 'Message content is required' }, { status: 400 });
		}

		console.log(recipient);

		let finalThreadId: string = threadId || '';

		// If no threadId provided, create new thread
		if (!threadId) {
			if (!recipient) {
				return json({ error: 'Recipient is required for new messages' }, { status: 400 });
			}

			// Find employer by email or company name
			const employerResult = await db
				.select()
				.from(employer)
				.where(or(eq(employer.contactEmail, recipient), eq(employer.companyName, recipient)))
				.limit(1);

			let applicantResult = [];
			if (!employerResult.length) {
				applicantResult = await db
					.select()
					.from(user)
					.where(or(eq(user.email, recipient), eq(user.name, recipient)))
					.limit(1);
			}

			if (!employerResult.length && !applicantResult.length) {
				return json({ error: 'Recipient not found' }, { status: 400 });
			}

			const employerId = employerResult[0].id;
			finalThreadId = randomUUID();

			// Create new thread
			await db.insert(messageThread).values({
				id: finalThreadId,
				userId,
				employerId,
				contextType,
				contextId,
				subject: subject || 'New Message',
				lastMessageAt: new Date(),
				lastMessagePreview: content.substring(0, 100),
				unreadByEmployer: 1,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		// Verify user has access to thread
		const thread = await db
			.select()
			.from(messageThread)
			.where(eq(messageThread.id, finalThreadId))
			.limit(1);

		if (!thread.length || thread[0].userId !== userId) {
			return json({ error: 'Thread not found' }, { status: 404 });
		}

		// Create the message
		const messageId = randomUUID();
		await db.insert(message).values({
			id: messageId,
			threadId: finalThreadId,
			senderUserId: userId,
			subject: threadId ? undefined : subject,
			content,
			messageType: 'text',
			priority,
			sentAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Handle file attachments
		if (files.length > 0) {
			const attachments = await Promise.all(
				files.map(async (file: any, index: any) => ({
					id: randomUUID(),
					messageId,
					filename: `${messageId}_${index}_${file.name}`,
					originalName: file.name,
					fileUrl: `/uploads/${messageId}/${file.name}`,
					fileType: file.type.split('/')[0],
					fileSize: file.size,
					mimeType: file.type,
					createdAt: new Date()
				}))
			);
			await db.insert(messageAttachment).values(attachments);
		}

		// Update thread with last message info
		await db
			.update(messageThread)
			.set({
				lastMessageAt: new Date(),
				lastMessagePreview: content.substring(0, 100),
				unreadByEmployer: sql`${messageThread.unreadByEmployer} + 1`,
				updatedAt: new Date()
			})
			.where(eq(messageThread.id, finalThreadId));

		// Get the created message with sender info
		const createdMessage = await db
			.select({
				id: message.id,
				threadId: message.threadId,
				senderUserId: message.senderUserId,
				senderEmployerId: message.senderEmployerId,
				subject: message.subject,
				content: message.content,
				messageType: message.messageType,
				isSystemMessage: message.isSystemMessage,
				priority: message.priority,
				sentAt: message.sentAt,
				createdAt: message.createdAt,
				senderUserName: user.name,
				senderUserEmail: user.email
			})
			.from(message)
			.leftJoin(user, eq(message.senderUserId, user.id))
			.where(eq(message.id, messageId))
			.limit(1);

		return json({
			success: true,
			message: createdMessage[0],
			threadId: finalThreadId
		});
	} catch (error) {
		console.error('Error sending message:', error);
		return json({ error: 'Failed to send message' }, { status: 500 });
	}
}
