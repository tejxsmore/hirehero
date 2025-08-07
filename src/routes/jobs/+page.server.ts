import { job, employer, application, saved, profile } from '$lib/db/schema';
import { db } from '$lib/db';
import type { PageServerLoad, Actions } from './$types';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/auth';

export const load: PageServerLoad = async ({ url, request }) => {
	const searchParams = url.searchParams;
	const searchTitle = searchParams.get('title') || '';
	const searchLocation = searchParams.get('location') || '';

	let savedJobIds: string[] = [];
	try {
		const session = await auth.api.getSession({
			headers: request.headers
		});
		if (session?.user) {
			// If user is logged in, fetch their saved job IDs
			const saveds = await db
				.select({ jobId: saved.jobId })
				.from(saved)
				.where(eq(saved.userId, session.user.id));
			savedJobIds = saveds.map((item) => item.jobId);
		}
	} catch (error) {
		console.error('Error fetching user session or saved jobs:', error);
		// Continue loading jobs even if user session or saved jobs fetch fails
	}

	try {
		const jobs = await db
			.select({
				id: job.id,
				title: job.title,
				description: job.description,
				type: job.type,
				category: job.category,
				// Compensation
				salaryMin: job.salaryMin,
				salaryMax: job.salaryMax,
				salaryCurrency: job.salaryCurrency,
				salaryType: job.salaryType,
				// Requirements
				experienceLevel: job.experienceLevel,
				educationLevel: job.educationLevel,
				skills: job.skills,
				// Location info
				locationType: job.locationType,
				country: job.country,
				city: job.city,
				address: job.address,
				// Job status and timing
				isPublished: job.isPublished,
				isArchived: job.isArchived,
				jobStatus: job.jobStatus,
				postedAt: job.postedAt,
				expiresAt: job.expiresAt,
				applicationCount: job.applicationCount,
				// Timestamps
				createdAt: job.createdAt,
				updatedAt: job.updatedAt,
				// Employer info
				employer: {
					id: employer.id,
					name: employer.companyName,
					description: employer.companyDescription,
					website: employer.companyWebsite,
					location: employer.companyLocation
				}
			})
			.from(job)
			.innerJoin(employer, eq(job.employerId, employer.id))
			.where(
				and(
					eq(job.isPublished, true), // Only show published jobs
					eq(job.isArchived, false) // Exclude archived jobs
				)
			)
			.orderBy(job.postedAt); // Order by most recent first

		const session = await auth.api.getSession({
			headers: request.headers
		});

		const userProfile = await db
			.select()
			.from(profile)
			.where(eq(profile.id, session?.user.id))
			.limit(1);

		return {
			jobs,
			savedJobIds, // Pass the fetched saved job IDs to the frontend
			searchParams: {
				title: searchTitle,
				location: searchLocation
			},
			profile: userProfile[0] || null
		};
	} catch (error) {
		console.error('Error loading jobs:', error);
		return {
			jobs: [],
			savedJobIds: [], // Ensure savedJobIds is always an array
			userApplications: {}, // This was in your original code, keeping it for consistency
			searchParams: {
				title: searchTitle,
				location: searchLocation
			},
			error: 'Failed to load jobs'
		};
	}
};
