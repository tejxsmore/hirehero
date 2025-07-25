import { auth } from '$lib/auth';
import { application, employer, job } from '$lib/db/schema';
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { randomUUID } from 'crypto';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		redirect(302, '/login');
	}

	const employerProfile = await db
		.select()
		.from(employer)
		.where(eq(employer.userId, session?.user.id));

	let jobsPosted = null;
	let applications = null;

	if (employerProfile.length >= 1) {
		jobsPosted = await db.select().from(job).where(eq(job.employerId, employerProfile[0].id));
		applications = await db
			.select()
			.from(application)
			.innerJoin(job, eq(application.jobId, job.id))
			.where(eq(job.employerId, employerProfile[0].id));
	}

	return {
		employerProfile: employerProfile[0] || null,
		hasEmployerProfile: employerProfile.length,
		jobsPosted,
		applications
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
			const companyWebsite = formData.get('website') as string | null;
			const companyLocation = formData.get('location') as string;
			const industry = formData.get('industry') as string | null;

			const registrationNumber = formData.get('registrationNumber') as string | null;
			const verificationDocUrl = formData.get('VerificationDoc') as string | null;

			const representativeName = formData.get('representativeName') as string | null;
			const representativeTitle = formData.get('representativeTitle') as string | null;
			const contactEmail = formData.get('email') as string;
			const contactPhone = formData.get('phone') as string | null;

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(contactEmail)) {
				return fail(400, { errorMessage: 'Please enter a valid email address.' });
			}

			await db.insert(employer).values({
				id: randomUUID(),
				userId: session.user.id,
				companyName,
				companyDescription,
				companyWebsite,
				companyLocation,
				industry,
				registrationNumber,
				verificationDocUrl,
				representativeName,
				representativeTitle,
				contactEmail,
				contactPhone,
				isVerified: true, // Or false if manual review needed
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (err) {
			console.error('Employer registration failed:', err);
			return fail(500, { errorMessage: 'Something went wrong. Please try again.' });
		}

		redirect(302, '/employer');
	}
};
