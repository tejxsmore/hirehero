import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/db';
import { job } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE({ request }) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { jobId } = await request.json();

	if (!jobId) {
		return json({ error: 'Job ID is required' }, { status: 400 });
	}

	try {
		const deletedJobs = await db.delete(job).where(eq(job.id, jobId)).returning();

		if (deletedJobs.length === 0) {
			return json({ error: 'Job not found' }, { status: 404 });
		}

		return json({ message: 'Job deleted successfully', job: deletedJobs[0] });
	} catch (error) {
		console.error('Error deleting job:', error);
		return json({ error: 'Failed to delete job' }, { status: 500 });
	}
}
