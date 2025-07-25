import {
	pgTable,
	text,
	timestamp,
	boolean,
	numeric,
	json,
	date,
	integer
} from 'drizzle-orm/pg-core';

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
// Profile Table - Main user profile info
//
export const profile = pgTable('profile', {
	id: text('id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),

	// Basic info
	fullName: text('full_name').notNull(),
	headline: text('headline'), // e.g. "Frontend Developer at XYZ"
	bio: text('bio'),
	location: text('location'), // e.g. "New Delhi, India"

	// Contact
	phone: text('phone'),
	email: text('email'), // Can be different from user.email

	// URLs
	resumeUrl: text('resume_url'),
	website: text('website'),
	linkedin: text('linkedin'),
	github: text('github'),
	portfolio: text('portfolio'),

	// Skills - small array, kept in profile for performance
	skills: json('skills').$type<string[]>(),

	// Profile completeness tracking
	isPublic: boolean('is_public')
		.$defaultFn(() => true)
		.notNull(),
	completenessScore: integer('completeness_score')
		.$defaultFn(() => 0)
		.notNull(),

	// Timestamps
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Experience Table
//
export const experience = pgTable('experience', {
	id: text('id').primaryKey(),
	profileId: text('profile_id')
		.notNull()
		.references(() => profile.id, { onDelete: 'cascade' }),

	company: text('company').notNull(),
	title: text('title').notNull(),
	location: text('location'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	isCurrent: boolean('is_current')
		.$defaultFn(() => false)
		.notNull(),
	description: text('description'),

	// For ordering experiences
	sortOrder: integer('sort_order')
		.$defaultFn(() => 0)
		.notNull(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Education Table
//
export const education = pgTable('education', {
	id: text('id').primaryKey(),
	profileId: text('profile_id')
		.notNull()
		.references(() => profile.id, { onDelete: 'cascade' }),

	institution: text('institution').notNull(),
	degree: text('degree').notNull(), // e.g. B.Tech, M.Sc
	fieldOfStudy: text('field_of_study'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	grade: text('grade'), // GPA or % etc.
	description: text('description'),

	// For ordering education entries
	sortOrder: integer('sort_order')
		.$defaultFn(() => 0)
		.notNull(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Project Table
//
export const project = pgTable('project', {
	id: text('id').primaryKey(),
	profileId: text('profile_id')
		.notNull()
		.references(() => profile.id, { onDelete: 'cascade' }),

	title: text('title').notNull(),
	description: text('description'),
	projectUrl: text('project_url'),
	githubUrl: text('github_url'),
	startDate: date('start_date'),
	endDate: date('end_date'),

	// Technologies - small array per project
	technologies: json('technologies').$type<string[]>(),

	// For ordering projects
	sortOrder: integer('sort_order')
		.$defaultFn(() => 0)
		.notNull(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Certification Table
//
export const certification = pgTable('certification', {
	id: text('id').primaryKey(),
	profileId: text('profile_id')
		.notNull()
		.references(() => profile.id, { onDelete: 'cascade' }),

	name: text('name').notNull(),
	issuer: text('issuer'),
	issueDate: date('issue_date'),
	expiryDate: date('expiry_date'),
	certificateUrl: text('certificate_url'),

	// For ordering certifications
	sortOrder: integer('sort_order')
		.$defaultFn(() => 0)
		.notNull(),

	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

//
// Employer Table
//
export const employer = pgTable('employer', {
	id: text('id').primaryKey(),

	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	// Company Info
	companyName: text('company_name').notNull(),
	companyDescription: text('company_description').notNull(),
	companyWebsite: text('company_website'),
	companyLocation: text('company_location').notNull(),
	industry: text('industry'),

	// Verification Info
	registrationNumber: text('registration_number'),
	verificationDocUrl: text('verification_doc_url'),
	isVerified: boolean('is_verified')
		.$defaultFn(() => false)
		.notNull(),

	// Contact Info
	representativeName: text('representative_name'),
	representativeTitle: text('representative_title'),
	contactEmail: text('contact_email').notNull(),
	contactPhone: text('contact_phone'),

	// Metadata
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
	type: text('type').notNull(), // full-time, part-time, contract, etc.
	category: text('category'), // engineering, marketing, sales, etc.

	// Compensation
	salaryMin: numeric('salary_min'),
	salaryMax: numeric('salary_max'),
	salaryCurrency: text('salary_currency').default('INR'),
	salaryType: text('salary_type'), // annual, monthly, hourly

	// Requirements
	experienceLevel: text('experience_level'), // entry, mid, senior
	educationLevel: text('education_level'),
	skills: json('skills').$type<string[]>(),

	// Location info
	locationType: text('location_type').notNull(), // remote, hybrid, onsite
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
	postedAt: timestamp('posted_at'),
	expiresAt: timestamp('expires_at'),

	// Application tracking
	applicationCount: integer('application_count')
		.$defaultFn(() => 0)
		.notNull(),

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
	status: text('status').default('pending').notNull(), // pending, reviewing, accepted, rejected, withdrawn
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
	reviewedAt: timestamp('reviewed_at'),

	// Timestamps
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});
