import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { profile, experience, education, project, certification } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		redirect(302, '/sign-in');
	}

	// Check if user already has a profile
	const userProfile = await db.select().from(profile).where(eq(profile.id, session?.user.id));

	// If profile exists, redirect to jobs page
	if (userProfile.length > 0) {
		redirect(302, '/jobs');
	}

	return {
		session
	};
};

// Fixed server action with better error handling and validation
export const actions: Actions = {
	register: async ({ request }) => {
		try {
			console.log('Register action called');

			// Get session to verify user
			const session = await auth.api.getSession({
				headers: request.headers
			});

			if (!session) {
				console.error('No session found');
				return fail(401, { error: 'Unauthorized - please sign in' });
			}

			const userId = session.user.id;
			console.log('User ID:', userId);

			// Parse FormData
			const formData = await request.formData();
			const dataString = formData.get('data') as string;

			if (!dataString) {
				console.error('No data string provided');
				return fail(400, { error: 'No form data provided' });
			}

			console.log('Raw data string:', dataString);

			// Parse the JSON string from form data
			let data;
			try {
				data = JSON.parse(dataString);
			} catch (parseError) {
				console.error('JSON parse error:', parseError);
				return fail(400, { error: 'Invalid form data format' });
			}

			console.log('Parsed data:', data);

			// Validate required fields
			if (!data.fullName || !data.email || !data.location || !data.headline) {
				return fail(400, {
					error: 'Missing required fields: fullName, email, location, or headline'
				});
			}

			// Check if profile already exists
			const existingProfile = await db
				.select()
				.from(profile)
				.where(eq(profile.id, userId))
				.limit(1);

			if (existingProfile.length > 0) {
				console.log('Profile already exists for user:', userId);
				return fail(400, { error: 'Profile already exists' });
			}

			// Start transaction to insert all profile data
			console.log('Starting database transaction...');

			const result = await db.transaction(async (tx) => {
				// 1. Insert Profile
				console.log('Inserting profile...');
				await tx.insert(profile).values({
					id: userId,
					fullName: data.fullName,
					headline: data.headline || null,
					bio: data.bio || null,
					location: data.location || null,
					phone: data.phone || null,
					email: data.email,
					resumeUrl: data.resumeUrl || null,
					website: data.website || null,
					linkedin: data.linkedin || null,
					github: data.github || null,
					portfolio: data.portfolio || null,
					skills: data.skills || [],
					isPublic: true,
					completenessScore: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				});

				// 2. Insert Experience entries
				if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
					console.log('Inserting experience entries...');
					const experienceEntries = data.experience
						.filter((exp: any) => exp.company && exp.title)
						.map((exp: any, index: number) => ({
							id: exp.id,
							profileId: userId,
							company: exp.company,
							title: exp.title,
							location: exp.location || null,
							startDate: exp.startDate || null,
							endDate: exp.isCurrent ? null : exp.endDate || null,
							isCurrent: exp.isCurrent || false,
							description: exp.description || null,
							sortOrder: index,
							createdAt: new Date(),
							updatedAt: new Date()
						}));

					if (experienceEntries.length > 0) {
						await tx.insert(experience).values(experienceEntries);
					}
				}

				// 3. Insert Education entries
				if (data.education && Array.isArray(data.education) && data.education.length > 0) {
					console.log('Inserting education entries...');
					const educationEntries = data.education
						.filter((edu: any) => edu.institution && edu.degree)
						.map((edu: any, index: number) => ({
							id: edu.id,
							profileId: userId,
							institution: edu.institution,
							degree: edu.degree,
							fieldOfStudy: edu.fieldOfStudy || null,
							startDate: edu.startDate || null,
							endDate: edu.endDate || null,
							grade: edu.grade || null,
							description: edu.description || null,
							sortOrder: index,
							createdAt: new Date(),
							updatedAt: new Date()
						}));

					if (educationEntries.length > 0) {
						await tx.insert(education).values(educationEntries);
					}
				}

				// 4. Insert Project entries
				if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
					console.log('Inserting project entries...');
					const projectEntries = data.projects
						.filter((proj: any) => proj.title)
						.map((proj: any, index: number) => ({
							id: proj.id,
							profileId: userId,
							title: proj.title,
							description: proj.description || null,
							projectUrl: proj.projectUrl || null,
							githubUrl: proj.githubUrl || null,
							startDate: proj.startDate || null,
							endDate: proj.endDate || null,
							technologies: proj.technologies || [],
							sortOrder: index,
							createdAt: new Date(),
							updatedAt: new Date()
						}));

					if (projectEntries.length > 0) {
						await tx.insert(project).values(projectEntries);
					}
				}

				// 5. Insert Certification entries
				if (
					data.certifications &&
					Array.isArray(data.certifications) &&
					data.certifications.length > 0
				) {
					console.log('Inserting certification entries...');
					const certificationEntries = data.certifications
						.filter((cert: any) => cert.name)
						.map((cert: any, index: number) => ({
							id: cert.id,
							profileId: userId,
							name: cert.name,
							issuer: cert.issuer || null,
							issueDate: cert.issueDate || null,
							expiryDate: cert.expiryDate || null,
							certificateUrl: cert.certificateUrl || null,
							sortOrder: index,
							createdAt: new Date(),
							updatedAt: new Date()
						}));

					if (certificationEntries.length > 0) {
						await tx.insert(certification).values(certificationEntries);
					}
				}

				console.log('Transaction completed successfully');
				return { success: true };
			});

			console.log('Profile registration completed:', result);

			// Return success response
			return {
				type: 'success',
				success: true,
				data: { message: 'Profile created successfully' }
			};
		} catch (error) {
			console.error('Error registering profile:', error);

			// Return more specific error information
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			const errorDetails = error instanceof Error ? error.stack : 'No stack trace available';

			console.error('Error details:', errorDetails);

			return fail(500, {
				error: 'Failed to create profile',
				details: errorMessage,
				timestamp: new Date().toISOString()
			});
		}
	}
};
