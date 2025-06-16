import { job, employer } from '$lib/db/schema';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ request }) => {
	const jobs = await db
		.select({
			id: job.id,
			title: job.title,
			employer: {
				id: employer.id,
				name: employer.companyName,
				description: employer.companyDescription
			}
		})
		.from(job)
		.innerJoin(employer, eq(job.employerId, employer.id));

	return {
		jobs
	};
};
