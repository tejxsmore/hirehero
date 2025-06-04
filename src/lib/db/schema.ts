import { pgTable, text, timestamp, boolean, numeric, json } from 'drizzle-orm/pg-core';

//
// Optional enums for safety and consistency
//
export const jobTypeEnum = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
export const locationTypeEnum = ['Remote', 'Onsite', 'Hybrid'] as const;
export const salaryTypeEnum = ['Annual', 'Monthly', 'Hourly'] as const;

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
	companyDescription: text('company_description'),
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
	slug: text('slug').notNull().unique(), // SEO-friendly unique identifier
	title: text('title').notNull(),
	description: text('description').notNull(),
	type: text('type').$type<(typeof jobTypeEnum)[number]>().notNull(), // enum: job type
	category: text('category'),

	// Compensation
	salaryMin: numeric('salary_min'),
	salaryMax: numeric('salary_max'),
	salaryCurrency: text('salary_currency').default('INR'),
	salaryType: text('salary_type').$type<(typeof salaryTypeEnum)[number]>(),

	// Requirements
	experienceLevel: text('experience_level'), // 'Entry', 'Mid', 'Senior'
	educationLevel: text('education_level'),
	skills: json('skills').$type<string[]>(), // JSON array of skill names

	// Location info
	locationType: text('location_type').$type<(typeof locationTypeEnum)[number]>().notNull(),
	country: text('country'),
	city: text('city'),
	address: text('address'),

	// Application method
	applicationUrl: text('application_url'),
	applicationEmail: text('application_email'),

	// Job status and timing
	isPublished: boolean('is_published')
		.$defaultFn(() => false)
		.notNull(),
	isArchived: boolean('is_archived')
		.$defaultFn(() => false)
		.notNull(),
	jobStatus: text('job_status').default('draft').notNull(), // e.g., draft, published, archived
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
