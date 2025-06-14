import type { PageServerLoad } from '../../employer/$types';
import { db } from '$lib/db';
import { job } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ request, params }) => {
	const id = params.id;
	const jobInfo = await db.select().from(job).where(eq(job.id, id));

	return {
		job: jobInfo[0]
	};
};
