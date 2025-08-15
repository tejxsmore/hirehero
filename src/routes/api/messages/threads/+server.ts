import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { messageThread, user, employer } from '$lib/db/schema';
import { eq, desc, or, like, sql, SQL } from 'drizzle-orm';
import { auth } from '$lib/auth';

export async function GET({ url, request }) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		const userId = session?.user.id;

		if (!userId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const filter = url.searchParams.get('filter') || 'all';
		const contextFilter = url.searchParams.get('context') || 'all';
		const search = url.searchParams.get('search') || '';

		const whereConditions: SQL[] = [eq(messageThread.userId, userId)];

		// Apply filters
		if (filter === 'unread') {
			whereConditions.push(sql`${messageThread.unreadByUser} > 0`);
		} else if (filter === 'archived') {
			whereConditions.push(eq(messageThread.isArchived, true));
		} else {
			whereConditions.push(eq(messageThread.isArchived, false));
		}

		if (contextFilter !== 'all') {
			whereConditions.push(eq(messageThread.contextType, contextFilter));
		}

		if (search) {
			const searchCondition = or(
				like(messageThread.subject, `%${search}%`),
				like(messageThread.lastMessagePreview, `%${search}%`)
			);
			if (searchCondition) {
				whereConditions.push(searchCondition);
			}
		}

		// Combine conditions into a single SQL
		const condition =
			whereConditions.length > 1
				? sql`(${sql.join(whereConditions, sql` AND `)})`
				: whereConditions[0];

		const threads = await db
			.select({
				id: messageThread.id,
				userId: messageThread.userId,
				employerId: messageThread.employerId,
				contextType: messageThread.contextType,
				contextId: messageThread.contextId,
				subject: messageThread.subject,
				isArchived: messageThread.isArchived,
				lastMessageAt: messageThread.lastMessageAt,
				lastMessagePreview: messageThread.lastMessagePreview,
				unreadByUser: messageThread.unreadByUser,
				unreadByEmployer: messageThread.unreadByEmployer,
				createdAt: messageThread.createdAt,
				updatedAt: messageThread.updatedAt,
				employerName: employer.companyName,
				employerEmail: employer.contactEmail
			})
			.from(messageThread)
			.leftJoin(employer, eq(messageThread.employerId, employer.id))
			.where(condition)
			.orderBy(desc(messageThread.lastMessageAt));

		return json({ threads });
	} catch (error) {
		console.error('Error fetching threads:', error);
		return json({ error: 'Failed to fetch threads' }, { status: 500 });
	}
}
