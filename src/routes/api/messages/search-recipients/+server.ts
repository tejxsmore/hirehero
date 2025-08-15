import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { employer, user, profile } from '$lib/db/schema';
import { like, or, sql } from 'drizzle-orm';
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

		const query = url.searchParams.get('q') || '';
		if (query.length < 2) {
			return json({ recipients: [] });
		}

		// Search employers by company name or email
		const employers = await db
			.select({
				id: employer.id,
				name: employer.companyName,
				email: employer.contactEmail,
				type: sql`'employer'`.as('type')
			})
			.from(employer)
			.where(
				or(like(employer.companyName, `%${query}%`), like(employer.contactEmail, `%${query}%`))
			)
			.limit(10);

		// Search users by name or email
		const users = await db
			.select({
				id: user.id,
				name: user.name, // ✅ change to match your schema
				email: user.email,
				type: sql`'user'`.as('type')
			})
			.from(user)
			.where(or(like(user.name, `%${query}%`), like(user.email, `%${query}%`)))
			.limit(10);

		// Combine results into a single array
		const recipients = [...employers, ...users].map((r) => ({
			id: r.id,
			name: r.name,
			email: r.email,
			company: r.type === 'employer' ? r.name : null,
			type: r.type
		}));

		return json({ recipients });
	} catch (error) {
		console.error('Error searching recipients:', error);
		return json({ error: 'Failed to search recipients' }, { status: 500 });
	}
}
