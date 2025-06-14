import { auth } from '$lib/auth';
import { redirect, fail } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { job, employer } from '$lib/db/schema';
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';

export const actions = {
	post: async ({ request }) => {
		const formData = await request.formData();

		try {
			const session = await auth.api.getSession({ headers: request.headers });
			const employerUserId = session?.user.id;

			const result = await db
				.select({ id: employer.id })
				.from(employer)
				.where(eq(employer.userId, employerUserId));
			const employerId = result[0]?.id;

			// Extract form data
			const title = formData.get('title')?.toString().trim();
			const description = formData.get('description')?.toString().trim();
			const type = formData.get('type')?.toString();
			const category = formData.get('category')?.toString() || null;

			const salaryMin = formData.get('salaryMin')?.toString();
			const salaryMax = formData.get('salaryMax')?.toString();
			const salaryCurrency = formData.get('salaryCurrency')?.toString() || 'INR';
			const salaryType = formData.get('salaryType')?.toString() || null;

			const experienceLevel = formData.get('experienceLevel')?.toString() || null;
			const educationLevel = formData.get('educationLevel')?.toString() || null;

			// Fixed skills handling - use a Set to prevent duplicates
			const skillsSet = new Set();

			// Get all form data entries and filter for skills
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('skills[') && key.endsWith(']')) {
					const skillValue = value.toString().trim();
					if (skillValue.length > 0) {
						// Add to set to ensure uniqueness
						skillsSet.add(skillValue);
					}
				}
			}

			// Convert Set to Array to maintain order
			const skills = Array.from(skillsSet);

			console.log('Processed skills:', skills);

			const locationType = formData.get('locationType')?.toString();
			const country = formData.get('country')?.toString() || null;
			const city = formData.get('city')?.toString() || null;
			const address = formData.get('address')?.toString() || null;

			const applicationUrl = formData.get('applicationUrl')?.toString() || null;
			const applicationEmail = formData.get('applicationEmail')?.toString() || null;

			const expiresAtString = formData.get('expiresAt')?.toString();
			const isPublished =
				formData.get('isPublished') === 'on' || formData.get('isPublished') === 'true';

			const jobId = randomUUID();

			const parsedSalaryMin = salaryMin ? Number.parseFloat(salaryMin) : null;
			const parsedSalaryMax = salaryMax ? Number.parseFloat(salaryMax) : null;

			let expiresAt = null;
			if (expiresAtString) {
				const parsed = new Date(expiresAtString);
				expiresAt = isNaN(parsed.getTime()) ? null : parsed;
			}

			const jobStatus = isPublished ? 'published' : 'draft';
			const postedAt = isPublished ? new Date() : null;

			// Prepare skills for database - preserve as entered by user
			const skillsForDb = skills.length > 0 ? JSON.stringify(skills) : null;

			const newJob = await db
				.insert(job)
				.values({
					id: jobId,
					employerId,
					title,
					description,
					type,
					category,
					salaryMin: parsedSalaryMin?.toString() || null,
					salaryMax: parsedSalaryMax?.toString() || null,
					salaryCurrency,
					salaryType,
					experienceLevel,
					educationLevel,
					skills: skillsForDb,
					locationType,
					country,
					city,
					address,
					applicationUrl,
					applicationEmail,
					isPublished,
					isArchived: false,
					jobStatus,
					postedAt,
					expiresAt,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			console.log('Job created successfully:', newJob[0]);

			if (!newJob || newJob.length === 0) {
				return fail(500, {
					error: 'Failed to create job listing',
					formData: Object.fromEntries(formData)
				});
			}
		} catch (error) {
			console.error('Error creating job:', error);
			return fail(500, {
				error: 'An unexpected error occurred while creating the job listing',
				formData: Object.fromEntries(formData)
			});
		}
		return redirect(302, `/employer`);
	}
};
