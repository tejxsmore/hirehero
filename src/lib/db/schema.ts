import { pgTable, text, timestamp, boolean, numeric, json, date } from 'drizzle-orm/pg-core';

//
// User Table
//
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Session Table
//
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

//
// Account Table
//
export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

//
// Verification Table
//
export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => new Date())
});

//
// Employer Table
//
export const employer = pgTable('employer', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	companyName: text('company_name').notNull(),
	companyDescription: text('company_description').notNull(),
	companyWebsite: text('company_website'),
	companyLocation: text('company_location').notNull(),
	contactEmail: text('contact_email').notNull(),
	isVerified: boolean('is_verified')
		.$defaultFn(() => true)
		.notNull(),
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Job Table
//
export const job = pgTable('job', {
	id: text('id').primaryKey(),

	// Association to employer
	employerId: text('employer_id')
		.notNull()
		.references(() => employer.id, { onDelete: 'cascade' }),

	// Job metadata
	title: text('title').notNull(),
	description: text('description').notNull(),
	type: text('type').notNull(),
	category: text('category'),

	// Compensation
	salaryMin: numeric('salary_min').notNull(),
	salaryMax: numeric('salary_max').notNull(),
	salaryCurrency: text('salary_currency').default('INR'),
	salaryType: text('salary_type').notNull(),

	// Requirements
	experienceLevel: text('experience_level'),
	educationLevel: text('education_level'),
	skills: json('skills').$type<string[]>(),

	// Location info
	locationType: text('location_type').notNull(),
	country: text('country'),
	city: text('city'),
	address: text('address'),

	// Job status and timing
	isPublished: boolean('is_published')
		.$defaultFn(() => false)
		.notNull(),
	isArchived: boolean('is_archived')
		.$defaultFn(() => false)
		.notNull(),
	jobStatus: text('job_status').default('draft').notNull(),
	postedAt: timestamp('posted_at').$defaultFn(() => new Date()),
	expiresAt: timestamp('expires_at'),

	// Timestamps
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Application Table
//
export const application = pgTable('application', {
	id: text('id').primaryKey(),

	// Foreign keys
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	jobId: text('job_id')
		.notNull()
		.references(() => job.id, { onDelete: 'cascade' }),

	// Application details
	status: text('status').default('pending').notNull(), // pending, accepted, rejected, withdrawn
	resumeUrl: text('resume_url'),
	coverLetter: text('cover_letter'),
	additionalInfo: json('additional_info').$type<Record<string, any>>(),

	// Tracking
	isWithdrawn: boolean('is_withdrawn')
		.$defaultFn(() => false)
		.notNull(),
	appliedAt: timestamp('applied_at')
		.$defaultFn(() => new Date())
		.notNull(),

	// Timestamps
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const profile = pgTable('profile', {
	id: text('id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),

	// Basic info
	fullName: text('full_name').notNull(),
	headline: text('headline'), // e.g. "Frontend Developer at XYZ"
	bio: text('bio'),
	profilePictureUrl: text('profile_picture_url'),
	location: text('location'), // e.g. "New Delhi, India"

	// Contact & social
	phone: text('phone'),
	website: text('website'),
	linkedin: text('linkedin'),
	github: text('github'),
	portfolio: text('portfolio'),

	// Resume
	resumeUrl: text('resume_url'),

	// Skills
	skills: json('skills').$type<string[]>(),

	// Timestamps
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const education = pgTable('education', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	institution: text('institution').notNull(),
	degree: text('degree').notNull(), // e.g. B.Tech, M.Sc
	fieldOfStudy: text('field_of_study'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	grade: text('grade'), // GPA or % etc.
	description: text('description'),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const experience = pgTable('experience', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	company: text('company').notNull(),
	title: text('title').notNull(),
	location: text('location'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	isCurrent: boolean('is_current')
		.$defaultFn(() => false)
		.notNull(),
	description: text('description'),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const project = pgTable('project', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	title: text('title').notNull(),
	description: text('description'),
	projectUrl: text('project_url'),
	githubUrl: text('github_url'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	technologies: json('technologies').$type<string[]>(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const certification = pgTable('certification', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	name: text('name').notNull(),
	issuer: text('issuer'),
	issueDate: date('issue_date'),
	expiryDate: date('expiry_date'),
	certificateUrl: text('certificate_url'),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});
