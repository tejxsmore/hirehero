import { db } from '$lib/db';
import { notificationQueue, messageTemplate, messageThread, message } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function processTemplate(templateId: string, variables: Record<string, string> = {}) {
	const template = await db
		.select()
		.from(messageTemplate)
		.where(eq(messageTemplate.id, templateId))
		.limit(1);

	if (!template.length) {
		throw new Error('Template not found');
	}

	const tmpl = template[0];
	let processedContent = tmpl.content ?? '';
	let processedSubject = tmpl.subject ?? '';

	for (const [key, value] of Object.entries(variables)) {
		const safeValue = String(value);
		const regex = new RegExp(`{{${key}}}`, 'g');
		processedContent = processedContent.replace(regex, safeValue);
		processedSubject = processedSubject.replace(regex, safeValue);
	}

	return {
		subject: processedSubject,
		content: processedContent,
		category: tmpl.category,
		triggerEvent: tmpl.triggerEvent
	};
}

export async function sendSystemMessage({
	userId,
	employerId = null,
	threadId = null,
	subject,
	content,
	contextType = 'system',
	contextId = null,
	templateId = null,
	templateVariables = {},
	priority = 'normal'
}: {
	userId: string;
	employerId?: string | null;
	threadId?: string | null;
	subject: string;
	content: string;
	contextType?: string;
	contextId?: string | null;
	templateId?: string | null;
	templateVariables?: Record<string, string>;
	priority?: string;
}) {
	let finalThreadId = threadId ?? randomUUID();

	// Create thread if it doesn't exist
	if (!threadId) {
		await db.insert(messageThread).values({
			id: finalThreadId,
			userId,
			employerId,
			contextType,
			contextId,
			subject,
			lastMessageAt: new Date(),
			lastMessagePreview: content.substring(0, 100),
			unreadByUser: 1,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	const messageId = randomUUID();

	await db.insert(message).values({
		id: messageId,
		threadId: finalThreadId,
		subject,
		content,
		messageType: 'system',
		isSystemMessage: true,
		templateId,
		templateVariables,
		priority,
		sentAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date()
	});

	await db
		.update(messageThread)
		.set({
			lastMessageAt: new Date(),
			lastMessagePreview: content.substring(0, 100),
			unreadByUser: sql`${messageThread.unreadByUser} + 1`,
			updatedAt: new Date()
		})
		.where(eq(messageThread.id, finalThreadId));

	return { threadId: finalThreadId, messageId };
}
