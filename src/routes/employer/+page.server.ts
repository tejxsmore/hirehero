import { auth } from '$lib/auth';
import { employer } from '$lib/db/schema';
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { randomUUID } from 'crypto';
import { fail } from 'assert';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		redirect(302, '/sign-in');
	}

	const employerProfile = await db
		.select()
		.from(employer)
		.where(eq(employer.userId, session?.user.id));

	return {
		employerProfile,
		hasEmployerProfile: employerProfile.length
	};
};

export const actions = {
	register: async ({ request }) => {
		try {
			const session = await auth.api.getSession({
				headers: request.headers
			});

			if (!session?.user.id) {
				return fail(401, { errorMessage: 'Unauthorized' });
			}

			const formData = await request.formData();
			const companyName = formData.get('name') as string;
			const companyDescription = formData.get('description') as string;
			const companyWebsite = formData.get('website') as string;
			const contactEmail = formData.get('email') as string;

			// Optional: email format validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(contactEmail)) {
				return fail(400, {
					errorMessage: 'Please enter a valid email address.'
				});
			}

			await db.insert(employer).values({
				id: randomUUID(),
				userId: session.user.id,
				companyName,
				companyDescription,
				companyWebsite,
				contactEmail,
				isVerified: true,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (err) {
			console.error('Employer registration failed:', err);
		}
		redirect(302, '/employer');
	}
};
