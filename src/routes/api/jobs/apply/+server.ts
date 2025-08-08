import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { application, job } from '$lib/db/schema';
import { auth } from '$lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) {
		throw error(401, 'You must be logged in to save jobs');
	}

	const { jobId, resumeUrl } = await request.json();

	if (!jobId) {
		throw error(400, 'Job ID is required');
	}

	try {
		// Check if the job is already application by the user
		const existingApplication = await db
			.select()
			.from(application)
			.where(and(eq(application.userId, session.user.id), eq(application.jobId, jobId)))
			.limit(1);

		if (existingApplication.length > 0) {
			return json({ message: 'Job already applied', application: true }, { status: 200 });
		}

		// Apply for the job
		await db.insert(application).values({
			id: randomUUID(),
			userId: session.user.id,
			jobId: jobId,
			status: 'pending',
			resumeUrl: resumeUrl,
			isWithdrawn: false,
			appliedAt: new Date(),
			createdAt: new Date()
		});

		await db
			.update(job)
			.set({ applicationCount: sql`${job.applicationCount} + 1` })
			.where(eq(job.id, jobId));

		return json({ message: 'Job applied successfully', application: true }, { status: 200 });
	} catch (e) {
		console.error('Error applying job:', e);
		throw error(500, 'Failed to apply for job');
	}
}
