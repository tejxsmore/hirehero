import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { message, messageAttachment, user, employer, messageThread } from '$lib/db/schema';
import { eq, desc, inArray, and } from 'drizzle-orm';
import { auth } from '$lib/auth';

export async function GET({ params, request }) {
	try {
		const { threadId } = params;

		// Authenticate user
		const session = await auth.api.getSession({
			headers: request.headers
		});
		const userId = session?.user.id;

		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Ensure thread belongs to user
		const thread = await db
			.select()
			.from(messageThread)
			.where(and(eq(messageThread.id, threadId), eq(messageThread.userId, userId)))
			.limit(1);

		if (!thread.length) {
			return json({ error: 'Thread not found' }, { status: 404 });
		}

		// Fetch messages with sender info
		const messages = await db
			.select({
				id: message.id,
				threadId: message.threadId,
				senderUserId: message.senderUserId,
				senderEmployerId: message.senderEmployerId,
				subject: message.subject,
				content: message.content,
				messageType: message.messageType,
				isSystemMessage: message.isSystemMessage,
				templateId: message.templateId,
				templateVariables: message.templateVariables,
				isRead: message.isRead,
				readAt: message.readAt,
				readBy: message.readBy,
				priority: message.priority,
				deliveryStatus: message.deliveryStatus,
				sentAt: message.sentAt,
				createdAt: message.createdAt,
				updatedAt: message.updatedAt,
				// Sender info
				senderUserName: user.name,
				senderUserEmail: user.email,
				senderEmployerName: employer.companyName,
				senderEmployerEmail: employer.contactEmail
			})
			.from(message)
			.leftJoin(user, eq(message.senderUserId, user.id))
			.leftJoin(employer, eq(message.senderEmployerId, employer.id))
			.where(eq(message.threadId, threadId))
			.orderBy(desc(message.sentAt));

		// Fetch attachments for these messages
		const messageIds = messages.map((m) => m.id);
		const attachments = messageIds.length
			? await db
					.select()
					.from(messageAttachment)
					.where(inArray(messageAttachment.messageId, messageIds))
			: [];

		// Group attachments by message ID (typed)
		const attachmentsByMessage = attachments.reduce<Record<string, (typeof attachments)[0][]>>(
			(acc, attachment) => {
				if (!acc[attachment.messageId]) {
					acc[attachment.messageId] = [];
				}
				acc[attachment.messageId].push(attachment);
				return acc;
			},
			{}
		);

		// Merge attachments into messages
		const messagesWithAttachments = messages.map((msg) => ({
			...msg,
			attachments: attachmentsByMessage[msg.id] || []
		}));

		return json({ messages: messagesWithAttachments });
	} catch (error) {
		console.error('Error fetching messages:', error);
		return json({ error: 'Failed to fetch messages' }, { status: 500 });
	}
}
