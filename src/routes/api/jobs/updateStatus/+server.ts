import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth'; // Assuming this path is correct for your auth utility
import { db } from '$lib/db';
import { job } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH({ request }) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { jobId, status } = await request.json();

	if (!jobId || !status) {
		return json({ error: 'Job ID and status are required' }, { status: 400 });
	}

	if (!['draft', 'published', 'closed'].includes(status)) {
		return json({ error: 'Invalid status provided' }, { status: 400 });
	}

	// Determine the new isPublished status based on the requested jobStatus
	const newIsPublished = status === 'published';
	// Determine the new isArchived status based on the requested jobStatus
	const newIsArchived = status === 'closed';

	try {
		const updatedJobs = await db
			.update(job)
			.set({
				jobStatus: status,
				isPublished: newIsPublished,
				isArchived: newIsArchived,
				updatedAt: new Date()
			})
			.where(eq(job.id, jobId))
			.returning();

		if (updatedJobs.length === 0) {
			return json({ error: 'Job not found' }, { status: 404 });
		}

		return json({ message: 'Job status updated successfully', job: updatedJobs[0] });
	} catch (error) {
		console.error('Error updating job status:', error);
		return json({ error: 'Failed to update job status' }, { status: 500 });
	}
}
