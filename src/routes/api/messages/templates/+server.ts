import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { messageTemplate } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
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

		const category = url.searchParams.get('category');
		const triggerEvent = url.searchParams.get('trigger');

		let whereConditions = [eq(messageTemplate.isActive, true)];

		if (category) {
			whereConditions.push(eq(messageTemplate.category, category));
		}

		if (triggerEvent) {
			whereConditions.push(eq(messageTemplate.triggerEvent, triggerEvent));
		}

		const templates = await db
			.select()
			.from(messageTemplate)
			.where(and(...whereConditions))
			.orderBy(messageTemplate.templateName);

		return json({ templates });
	} catch (error) {
		console.error('Error fetching templates:', error);
		return json({ error: 'Failed to fetch templates' }, { status: 500 });
	}
}
