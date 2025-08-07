import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { saved } from '$lib/db/schema';
import { auth } from '$lib/auth';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) {
		throw error(401, 'You must be logged in to save jobs');
	}

	const { jobId } = await request.json();

	if (!jobId) {
		throw error(400, 'Job ID is required');
	}

	try {
		// Check if the job is already saved by the user
		const existingSave = await db
			.select()
			.from(saved)
			.where(and(eq(saved.userId, session.user.id), eq(saved.jobId, jobId)))
			.limit(1);

		if (existingSave.length > 0) {
			// If already saved, return a success message without re-inserting
			return json({ message: 'Job already saved', saved: true }, { status: 200 });
		}

		// Save the job
		await db.insert(saved).values({
			id: randomUUID(),
			userId: session.user.id,
			jobId: jobId,
			createdAt: new Date()
		});

		return json({ message: 'Job saved successfully', saved: true }, { status: 200 });
	} catch (e) {
		console.error('Error saving job:', e);
		throw error(500, 'Failed to save job');
	}
}
