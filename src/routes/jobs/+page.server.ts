import { job, employer } from '$lib/db/schema';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	// Extract search parameters for server-side filtering if needed
	const searchParams = url.searchParams;
	const searchTitle = searchParams.get('title') || '';
	const searchLocation = searchParams.get('location') || '';

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

				// Application method
				applicationUrl: job.applicationUrl,
				applicationEmail: job.applicationEmail,

				// Job status and timing
				isPublished: job.isPublished,
				isArchived: job.isArchived,
				jobStatus: job.jobStatus,
				postedAt: job.postedAt,
				expiresAt: job.expiresAt,

				// Timestamps
				createdAt: job.createdAt,
				updatedAt: job.updatedAt,

				// Employer info
				employer: {
					id: employer.id,
					name: employer.companyName,
					description: employer.companyDescription
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

		return {
			jobs,
			searchParams: {
				title: searchTitle,
				location: searchLocation
			}
		};
	} catch (error) {
		console.error('Error loading jobs:', error);
		return {
			jobs: [],
			searchParams: {
				title: searchTitle,
				location: searchLocation
			},
			error: 'Failed to load jobs'
		};
	}
};
