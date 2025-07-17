import { job, employer, application, user } from '$lib/db/schema';
import { db } from '$lib/db';
import type { PageServerLoad, Actions } from './$types';
import { eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { auth } from '$lib/auth';

export const load: PageServerLoad = async ({ url, locals }) => {
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
			userApplications: {},
			searchParams: {
				title: searchTitle,
				location: searchLocation
			},
			error: 'Failed to load jobs'
		};
	}
};

export const actions: Actions = {
	apply: async ({ request }) => {
		const session = await auth.api.getSession({
			headers: request.headers
		});

		if (!session) {
			return fail(401, {
				message: 'You must be logged in to apply for jobs'
			});
		}

		try {
			const formData = await request.formData();
			const selectedJobId = formData.get('selectedJobId') as string;

			if (!selectedJobId) {
				return fail(400, {
					message: 'Job ID is required'
				});
			}

			// Check if job exists and is still available
			const jobExists = await db
				.select({
					id: job.id,
					title: job.title,
					applicationCount: job.applicationCount,
					expiresAt: job.expiresAt
				})
				.from(job)
				.where(and(eq(job.id, selectedJobId), eq(job.isPublished, true), eq(job.isArchived, false)))
				.limit(1);

			if (jobExists.length === 0) {
				return fail(404, {
					message: 'Job not found or no longer available'
				});
			}

			// Check if job has expired
			const currentJob = jobExists[0];
			if (currentJob.expiresAt && new Date() > new Date(currentJob.expiresAt)) {
				return fail(400, {
					message: 'This job posting has expired'
				});
			}

			// Check if user has already applied for this job (and not withdrawn)
			const existingApplication = await db
				.select({
					id: application.id,
					status: application.status,
					isWithdrawn: application.isWithdrawn
				})
				.from(application)
				.where(and(eq(application.jobId, selectedJobId), eq(application.userId, session.user.id)))
				.limit(1);

			if (existingApplication.length > 0 && !existingApplication[0].isWithdrawn) {
				return fail(409, {
					message: 'You have already applied for this job'
				});
			}

			// Generate application ID
			const applicationId = crypto.randomUUID();

			// Create job application
			await db.insert(application).values({
				id: applicationId,
				jobId: selectedJobId,
				userId: session.user.id,
				status: 'pending',
				appliedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Update job application count
			await db
				.update(job)
				.set({
					applicationCount: (currentJob.applicationCount || 0) + 1,
					updatedAt: new Date()
				})
				.where(eq(job.id, selectedJobId));

			return {
				type: 'success',
				message: 'Application submitted successfully',
				data: {
					applicationId,
					jobTitle: currentJob.title
				}
			};
		} catch (error) {
			console.error('Error submitting job application:', error);
			return fail(500, {
				message: 'An error occurred while submitting your application'
			});
		}
	}
};
