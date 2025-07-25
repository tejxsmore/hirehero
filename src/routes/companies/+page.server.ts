import type { PageServerLoad } from './$types';
import { employer } from '$lib/db/schema';
import { db } from '$lib/db';

export const load: PageServerLoad = async () => {
	const companies = await db.select().from(employer);

	return {
		companies
	};
};
