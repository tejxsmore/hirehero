import { sql } from 'drizzle-orm';
import {
	pgTable,
	text,
	timestamp,
	boolean,
	numeric,
	json,
	date,
	integer,
	unique,
	index,
	check
} from 'drizzle-orm/pg-core';

//
// User Table
//
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
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
	email: text('email'), // Can be different from user.email
	phone: text('phone'),
	resumeUrl: text('resume_url'),
	location: text('location'),
	headline: text('headline'),
	bio: text('bio'),

	// URLs
	portfolio: text('portfolio'),
	linkedin: text('linkedin'),
	github: text('github'),

	// Skills - small array, kept in profile for performance
	skills: json('skills').$type<string[]>(),

	// Profile completeness tracking
	isPublic: boolean('is_public').default(true).notNull(),
	completenessScore: integer('completeness_score').default(0).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	isCurrent: boolean('is_current').default(false).notNull(),
	description: text('description'),

	// For ordering experiences
	sortOrder: integer('sort_order').default(0).notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	sortOrder: integer('sort_order').default(0).notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	sortOrder: integer('sort_order').default(0).notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	sortOrder: integer('sort_order').default(0).notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	companyIndustry: text('company_industry'),
	companySize: text('company_size'),
	companyDescription: text('company_description').notNull(),
	companyWebsite: text('company_website'),
	companyLocation: text('company_location').notNull(),

	// Verification Info
	registrationNumber: text('registration_number'),
	verificationDocUrl: text('verification_doc_url'),
	isVerified: boolean('is_verified').default(false).notNull(),

	// Contact Info
	representativeName: text('representative_name'),
	representativeTitle: text('representative_title'),
	contactEmail: text('contact_email').notNull(),
	contactPhone: text('contact_phone'),

	// Metadata
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	isPublished: boolean('is_published').default(false).notNull(),
	isArchived: boolean('is_archived').default(false).notNull(),
	jobStatus: text('job_status').default('draft').notNull(),
	postedAt: timestamp('posted_at'),
	expiresAt: timestamp('expires_at'),

	// Application tracking
	applicationCount: integer('application_count').default(0).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
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
	status: text('status').default('pending').notNull(), // pending, reviewing, shortlisted, accepted, rejected, withdrawn
	resumeUrl: text('resume_url'),
	coverLetter: text('cover_letter'),
	additionalInfo: json('additional_info').$type<Record<string, any>>(),

	// Tracking
	isWithdrawn: boolean('is_withdrawn').default(false).notNull(),
	appliedAt: timestamp('applied_at').defaultNow().notNull(),
	reviewedAt: timestamp('reviewed_at'),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

//
// Saved Jobs Table
//
export const saved = pgTable('saved', {
	id: text('id').primaryKey(),

	// Foreign keys
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	jobId: text('job_id')
		.notNull()
		.references(() => job.id, { onDelete: 'cascade' }),

	// Timestamp
	createdAt: timestamp('created_at').defaultNow().notNull()
});

//
// Message Templates Table - For predefined system messages
//
export const messageTemplate = pgTable('message_template', {
	id: text('id').primaryKey(),
	templateKey: text('template_key').notNull().unique(),
	templateName: text('template_name').notNull(),
	subject: text('subject'),
	content: text('content').notNull(),
	category: text('category').notNull(), // 'application', 'job', 'profile', 'system'
	triggerEvent: text('trigger_event').notNull(), // 'status_change', 'job_posted', 'profile_updated'
	isActive: boolean('is_active').default(true).notNull(),
	templateVariables: json('template_variables').$type<string[]>(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

//
// Message Threads Table - Groups related messages together
//
export const messageThread = pgTable('message_thread', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	employerId: text('employer_id').references(() => employer.id, { onDelete: 'cascade' }),

	contextType: text('context_type').notNull(), // 'application', 'job_inquiry', 'general', 'system'
	contextId: text('context_id'), // ID of related application, job, etc.

	subject: text('subject'),
	isArchived: boolean('is_archived').default(false).notNull(),

	lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
	lastMessagePreview: text('last_message_preview'), // First 100 chars of last message

	unreadByUser: integer('unread_by_user').default(0).notNull(),
	unreadByEmployer: integer('unread_by_employer').default(0).notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

//
// Messages Table - Individual messages
//
export const message = pgTable('message', {
	id: text('id').primaryKey(),
	threadId: text('thread_id')
		.notNull()
		.references(() => messageThread.id, { onDelete: 'cascade' }),

	// Message sender (either user or employer, but not both)
	senderUserId: text('sender_user_id').references(() => user.id, { onDelete: 'cascade' }),
	senderEmployerId: text('sender_employer_id').references(() => employer.id, {
		onDelete: 'cascade'
	}),

	// Message content
	subject: text('subject'), // Optional, mainly for first message in thread
	content: text('content').notNull(),
	messageType: text('message_type').default('text').notNull(), // 'text', 'system', 'template'

	// System message details
	isSystemMessage: boolean('is_system_message').default(false).notNull(),
	templateId: text('template_id').references(() => messageTemplate.id),
	templateVariables: json('template_variables').$type<Record<string, any>>(),

	// Message status
	isRead: boolean('is_read').default(false).notNull(),
	readAt: timestamp('read_at'),
	readBy: text('read_by'), // 'user' or 'employer'

	// Message metadata
	priority: text('priority').default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
	deliveryStatus: text('delivery_status').default('sent').notNull(), // 'sent', 'delivered', 'failed'

	// Timestamps
	sentAt: timestamp('sent_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

//
// Message Attachments Table
//
export const messageAttachment = pgTable('message_attachment', {
	id: text('id').primaryKey(),
	messageId: text('message_id')
		.notNull()
		.references(() => message.id, { onDelete: 'cascade' }),

	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	fileUrl: text('file_url').notNull(),
	fileType: text('file_type').notNull(), // 'image', 'document', 'pdf', etc.
	fileSize: integer('file_size'), // in bytes
	mimeType: text('mime_type'),

	createdAt: timestamp('created_at').defaultNow().notNull()
});

//
// Application Status History - Track all status changes for messaging
//
export const applicationStatusHistory = pgTable('application_status_history', {
	id: text('id').primaryKey(),
	applicationId: text('application_id')
		.notNull()
		.references(() => application.id, { onDelete: 'cascade' }),

	fromStatus: text('from_status'),
	toStatus: text('to_status').notNull(),
	changedBy: text('changed_by'), // userId or employerId who made the change
	changedByType: text('changed_by_type'), // 'user' or 'employer'

	reason: text('reason'), // Optional reason for status change
	notes: text('notes'), // Internal notes

	// Message trigger tracking
	messageTriggered: boolean('message_triggered').default(false).notNull(),
	messageId: text('message_id').references(() => message.id),

	createdAt: timestamp('created_at').defaultNow().notNull()
});

//
// Notification Queue Table - For managing message delivery
//
export const notificationQueue = pgTable('notification_queue', {
	id: text('id').primaryKey(),

	// Target recipient
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	employerId: text('employer_id').references(() => employer.id, { onDelete: 'cascade' }),

	// Notification details
	type: text('type').notNull(), // 'application_update', 'job_notification', 'system'
	channel: text('channel').notNull(), // 'email', 'push', 'sms', 'in_app'
	title: text('title').notNull(),
	content: text('content').notNull(),

	// Related entities
	messageId: text('message_id').references(() => message.id, { onDelete: 'cascade' }),
	threadId: text('thread_id').references(() => messageThread.id, { onDelete: 'cascade' }),

	// Delivery tracking
	status: text('status').default('pending').notNull(), // 'pending', 'sent', 'delivered', 'failed', 'cancelled'
	attempts: integer('attempts').default(0).notNull(),
	maxAttempts: integer('max_attempts').default(3).notNull(),

	// Scheduling
	scheduledFor: timestamp('scheduled_for').defaultNow().notNull(),
	sentAt: timestamp('sent_at'),
	deliveredAt: timestamp('delivered_at'),

	// Error tracking
	error: text('error'),
	metadata: json('metadata').$type<Record<string, any>>(), // Provider-specific data

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

//
// Message Reactions Table - For acknowledgments and reactions
//
export const messageReaction = pgTable('message_reaction', {
	id: text('id').primaryKey(),
	messageId: text('message_id')
		.notNull()
		.references(() => message.id, { onDelete: 'cascade' }),

	// Reactor (user or employer)
	reactorUserId: text('reactor_user_id').references(() => user.id, { onDelete: 'cascade' }),
	reactorEmployerId: text('reactor_employer_id').references(() => employer.id, {
		onDelete: 'cascade'
	}),

	reactionType: text('reaction_type').notNull(), // 'like', 'acknowledge', 'thumbs_up', etc.

	createdAt: timestamp('created_at').defaultNow().notNull()
});

// =============================================================================
// CONSTRAINTS & UNIQUE INDEXES
// =============================================================================

// User table constraints
export const userEmailUniqueIdx = unique('user_email_unique').on(user.email);

// Session table constraints
export const sessionTokenUniqueIdx = unique('session_token_unique').on(session.token);

// Application unique constraint - one application per user per job
export const uniqueApplicationConstraint = unique('unique_application').on(
	application.userId,
	application.jobId
);

// Saved jobs unique constraint - one save per user per job
export const uniqueSavedConstraint = unique('unique_saved').on(saved.userId, saved.jobId);

// Message thread unique constraint - one thread per user-employer-context combination
export const uniqueThreadConstraint = unique('unique_thread').on(
	messageThread.userId,
	messageThread.employerId,
	messageThread.contextType,
	messageThread.contextId
);

// Message reaction unique constraint - one reaction per user per message per type
export const uniqueReactionConstraint = unique('unique_reaction').on(
	messageReaction.messageId,
	messageReaction.reactorUserId,
	messageReaction.reactorEmployerId,
	messageReaction.reactionType
);

// =============================================================================
// CHECK CONSTRAINTS
// =============================================================================

// Message sender validation - ensure only one sender is set
export const messageSenderCheck = check(
	'sender_check',
	sql`(sender_user_id IS NOT NULL AND sender_employer_id IS NULL) OR 
	    (sender_user_id IS NULL AND sender_employer_id IS NOT NULL) OR
	    (is_system_message = true AND sender_user_id IS NULL AND sender_employer_id IS NULL)`
);

// Notification recipient validation - ensure only one recipient is set
export const notificationRecipientCheck = check(
	'recipient_check',
	sql`(user_id IS NOT NULL AND employer_id IS NULL) OR 
	    (user_id IS NULL AND employer_id IS NOT NULL)`
);

// Message reaction reactor validation - ensure only one reactor is set
export const reactionReactorCheck = check(
	'reactor_check',
	sql`(reactor_user_id IS NOT NULL AND reactor_employer_id IS NULL) OR 
	    (reactor_user_id IS NULL AND reactor_employer_id IS NOT NULL)`
);
