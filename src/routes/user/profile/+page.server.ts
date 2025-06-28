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
	technologies?: string[];
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

// === Load ===

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		throw redirect(302, '/sign-in');
	}
	const userId = session.user.id;

	const [profileData, experiences, educations, projects, certifications] = await Promise.all([
		db.select().from(profile).where(eq(profile.id, userId)),
		db.select().from(experience).where(eq(experience.profileId, userId)),
		db.select().from(education).where(eq(education.profileId, userId)),
		db.select().from(project).where(eq(project.profileId, userId)),
		db.select().from(certification).where(eq(certification.profileId, userId))
	]);

	return {
		profile: profileData[0],
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
			} catch {
				return fail(400, { error: 'Invalid JSON format' });
			}

			if (!data.fullName || !data.email || !data.location || !data.headline) {
				return fail(400, {
					error: 'Missing required fields: fullName, email, location, or headline'
				});
			}

			const existingProfile = await db
				.select()
				.from(profile)
				.where(eq(profile.id, userId))
				.limit(1);

			if (existingProfile.length > 0) {
				return fail(400, { error: 'Profile already exists' });
			}

			// ⚠️ If using neon-http, don't use transactions. Use sequential inserts.
			await db.insert(profile).values({
				id: userId,
				fullName: data.fullName,
				headline: data.headline ?? null,
				bio: data.bio ?? null,
				location: data.location ?? null,
				phone: data.phone ?? null,
				email: data.email,
				resumeUrl: data.resumeUrl ?? null,
				website: data.website ?? null,
				linkedin: data.linkedin ?? null,
				github: data.github ?? null,
				portfolio: data.portfolio ?? null,
				skills: data.skills ?? [],
				isPublic: true,
				completenessScore: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			// Experience
			const expEntries =
				data.experience
					?.filter((e) => e.company && e.title)
					.map((e, i) => ({
						id: e.id,
						profileId: userId,
						company: e.company,
						title: e.title,
						location: e.location ?? null,
						startDate: e.startDate ?? null,
						endDate: e.isCurrent ? null : (e.endDate ?? null),
						isCurrent: e.isCurrent ?? false,
						description: e.description ?? null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) ?? [];

			if (expEntries.length > 0) await db.insert(experience).values(expEntries);

			// Education
			const eduEntries =
				data.education
					?.filter((e) => e.institution && e.degree)
					.map((e, i) => ({
						id: e.id,
						profileId: userId,
						institution: e.institution,
						degree: e.degree,
						fieldOfStudy: e.fieldOfStudy ?? null,
						startDate: e.startDate ?? null,
						endDate: e.endDate ?? null,
						grade: e.grade ?? null,
						description: e.description ?? null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) ?? [];

			if (eduEntries.length > 0) await db.insert(education).values(eduEntries);

			// Projects
			const projectEntries =
				data.projects
					?.filter((p) => p.title)
					.map((p, i) => ({
						id: p.id,
						profileId: userId,
						title: p.title,
						description: p.description ?? null,
						projectUrl: p.projectUrl ?? null,
						githubUrl: p.githubUrl ?? null,
						startDate: p.startDate ?? null,
						endDate: p.endDate ?? null,
						technologies: p.technologies ?? [],
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) ?? [];

			if (projectEntries.length > 0) await db.insert(project).values(projectEntries);

			// Certifications
			const certEntries =
				data.certifications
					?.filter((c) => c.name)
					.map((c, i) => ({
						id: c.id,
						profileId: userId,
						name: c.name,
						issuer: c.issuer ?? null,
						issueDate: c.issueDate ?? null,
						expiryDate: c.expiryDate ?? null,
						certificateUrl: c.certificateUrl ?? null,
						sortOrder: i,
						createdAt: new Date(),
						updatedAt: new Date()
					})) ?? [];

			if (certEntries.length > 0) await db.insert(certification).values(certEntries);

			return {
				type: 'success',
				success: true,
				data: { message: 'Profile created successfully' }
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error during profile creation:', error);

			return fail(500, {
				error: 'Failed to create profile',
				details: errorMessage,
				timestamp: new Date().toISOString()
			});
		}
	}
};
