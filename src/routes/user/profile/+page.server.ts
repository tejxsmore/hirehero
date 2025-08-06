import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { profile, experience, education, project, certification } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { redirect, fail } from '@sveltejs/kit';

// === Type Definitions ===
interface ExperienceEntry {
	id: string;
	company: string;
	title: string;
	location?: string;
	startDate?: string;
	endDate?: string;
	isCurrent?: boolean;
	description?: string;
}

interface EducationEntry {
	id: string;
	institution: string;
	degree: string;
	fieldOfStudy?: string;
	startDate?: string;
	endDate?: string;
	grade?: string;
	description?: string;
}

interface ProjectEntry {
	id: string;
	title: string;
	description?: string;
	projectUrl?: string;
	githubUrl?: string;
	startDate?: string;
	endDate?: string;
	technologies?: string | string[]; // Allow string for input, will convert to string[]
}

interface CertificationEntry {
	id: string;
	name: string;
	issuer?: string;
	issueDate?: string;
	expiryDate?: string;
	certificateUrl?: string;
}

interface ProfileData {
	fullName: string;
	email: string;
	location: string;
	headline: string;
	bio?: string;
	phone?: string;
	resumeUrl?: string;
	website?: string;
	linkedin?: string;
	github?: string;
	portfolio?: string;
	skills?: string[];
	experience?: ExperienceEntry[];
	education?: EducationEntry[];
	projects?: ProjectEntry[];
	certifications?: CertificationEntry[];
}

// Helper function to format date strings to YYYY-MM-DD for Drizzle's date type
function formatDateForDb(dateString: string | undefined | null): string | null {
	if (!dateString) return null;
	try {
		// Attempt to parse as a Date object first
		const date = new Date(dateString);
		// Check if the date is valid and not 'Invalid Date'
		if (isNaN(date.getTime())) {
			// If it's not a valid date string, check if it's already in YYYY-MM-DD format
			return dateString.match(/^\d{4}-\d{2}-\d{2}$/) ? dateString : null;
		}
		// Format to YYYY-MM-DD
		return date.toISOString().split('T')[0];
	} catch (e) {
		console.error('Error formatting date:', dateString, e);
		return null;
	}
}

// === Load ===
export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) {
		throw redirect(302, '/login');
	}
	const userId = session.user.id;

	// Fetch existing profile data to pre-fill the form if needed
	const [profileData, experiences, educations, projects, certifications] = await Promise.all([
		db.select().from(profile).where(eq(profile.id, userId)).limit(1),
		db.select().from(experience).where(eq(experience.profileId, userId)),
		db.select().from(education).where(eq(education.profileId, userId)),
		db.select().from(project).where(eq(project.profileId, userId)),
		db.select().from(certification).where(eq(certification.profileId, userId))
	]);

	return {
		profile: profileData[0] || null, // Return null if no profile exists
		experiences,
		educations,
		projects,
		certifications
	};
};

// === Actions ===
export const actions: Actions = {
	register: async ({ request }) => {
		try {
			const session = await auth.api.getSession({ headers: request.headers });
			if (!session) return fail(401, { error: 'Unauthorized - please sign in' });

			const userId = session.user.id;
			const formData = await request.formData();
			const rawData = formData.get('data') as string;

			if (!rawData) return fail(400, { error: 'No form data provided' });

			let data: ProfileData;
			try {
				data = JSON.parse(rawData) as ProfileData;
			} catch (parseError) {
				console.error('JSON parse error:', parseError);
				return fail(400, { error: 'Invalid JSON format' });
			}

			// Basic validation before submission
			if (!data.fullName || !data.email || !data.location || !data.headline) {
				return fail(400, {
					error: 'Missing required fields: Full Name, Email, Location, or Professional Headline'
				});
			}

			// Check if profile already exists (assuming this is for initial registration)
			const existingProfile = await db
				.select()
				.from(profile)
				.where(eq(profile.id, userId))
				.limit(1);

			if (existingProfile.length > 0) {
				// If profile exists, you might want to update instead of fail,
				// or redirect to an edit page. For now, it fails as per original logic.
				return fail(400, { error: 'Profile already exists for this user.' });
			}

			// Insert main profile data
			await db.insert(profile).values({
				id: userId,
				fullName: data.fullName,
				email: data.email,
				phone: data.phone || null,
				resumeUrl: data.resumeUrl || null,
				location: data.location || null,
				headline: data.headline || null,
				bio: data.bio || null,
				portfolio: data.portfolio || null,
				linkedin: data.linkedin || null,
				github: data.github || null,
				skills: data.skills || [], // Ensure skills is an array, even if empty
				isPublic: true,
				completenessScore: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Experience
			const expEntries =
				data.experience
					?.filter((e) => e.company && e.title) // Only include if company and title are present
					.map((e, i) => ({
						id: e.id,
						profileId: userId,
						company: e.company,
						title: e.title,
						location: e.location || null,
						startDate: formatDateForDb(e.startDate), // Apply date formatting
						endDate: e.isCurrent ? null : formatDateForDb(e.endDate), // Apply date formatting
						isCurrent: e.isCurrent ?? false,
						description: e.description || null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) || [];
			if (expEntries.length > 0) {
				await db.insert(experience).values(expEntries);
			}

			// Education
			const eduEntries =
				data.education
					?.filter((e) => e.institution && e.degree) // Only include if institution and degree are present
					.map((e, i) => ({
						id: e.id,
						profileId: userId,
						institution: e.institution,
						degree: e.degree,
						fieldOfStudy: e.fieldOfStudy || null,
						startDate: formatDateForDb(e.startDate), // Apply date formatting
						endDate: formatDateForDb(e.endDate), // Apply date formatting
						grade: e.grade || null,
						description: e.description || null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) || [];
			if (eduEntries.length > 0) {
				await db.insert(education).values(eduEntries);
			}

			// Projects
			const projectEntries =
				data.projects
					?.filter((p) => p.title) // Only include if title is present
					.map((p, i) => ({
						id: p.id,
						profileId: userId,
						title: p.title,
						description: p.description || null,
						projectUrl: p.projectUrl || null,
						githubUrl: p.githubUrl || null,
						startDate: formatDateForDb(p.startDate), // Apply date formatting
						endDate: formatDateForDb(p.endDate), // Apply date formatting
						// Split the technologies string into an array, trim spaces, and filter out empty strings
						technologies:
							typeof p.technologies === 'string'
								? p.technologies
										.split(',')
										.map((tech) => tech.trim())
										.filter((tech) => tech.length > 0)
								: p.technologies || [], // Ensure it's an array
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) || [];
			if (projectEntries.length > 0) {
				await db.insert(project).values(projectEntries);
			}

			// Certifications
			const certEntries =
				data.certifications
					?.filter((c) => c.name) // Only include if name is present
					.map((c, i) => ({
						id: c.id,
						profileId: userId,
						name: c.name,
						issuer: c.issuer || null,
						issueDate: formatDateForDb(c.issueDate), // Apply date formatting
						expiryDate: formatDateForDb(c.expiryDate), // Apply date formatting
						certificateUrl: c.certificateUrl || null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) || [];
			if (certEntries.length > 0) {
				await db.insert(certification).values(certEntries);
			}

			// Redirect to jobs page on successful registration
			throw redirect(302, '/jobs');
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error during profile creation:', error);

			// If it's a redirect, re-throw it
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				throw error;
			}

			return fail(500, {
				error: 'Failed to register profile',
				details: errorMessage,
				timestamp: new Date().toISOString()
			});
		}
	}
};
