import { auth } from '$lib/auth';
import { job } from '$lib/db/schema';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		redirect(302, '/sign-in');
	}

	const jobs = await db.select().from(job);

	return {
		jobs
	};
};
