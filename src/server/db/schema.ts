import { createId } from "@paralleldrive/cuid2"
import {
	char,
	pgTableCreator,
	timestamp,
	text,
	check,
	integer,
	index,
	jsonb
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm"

export const createTable = pgTableCreator((name) => `zendesk_${name}`)

const timestamps = {
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$default(() => new Date())
		.$onUpdate(() => new Date())
}

export const customers = createTable(
	"customer",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		...timestamps,
		email: text("email").notNull().unique(),
		name: text("name").notNull(),
		metadata: jsonb("metadata")
			.$type<Record<string, string>>()
			.notNull()
			.default({})
	},
	(table) => ({
		emailIndex: index("customers_email_idx").on(table.email)
	})
)

export const users = createTable(
	"user",
	{
		clerkId: text("clerk_id").primaryKey().notNull(),
		...timestamps,
		teamId: char("team_id", { length: 24 })
			.notNull()
			.references(() => teams.id),
		avatar: text("avatar").notNull(),
		email: text("email").notNull().unique(),
		name: text("name").notNull(),
		role: text("role").$type<"member" | "admin">().notNull().default("member")
	},
	(table) => ({
		emailIndex: index("users_email_idx").on(table.email),
		teamIdIndex: index("users_team_id_idx").on(table.teamId),
		roleIndex: index("users_role_idx").on(table.role)
	})
)

export const files = createTable(
	"file",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		...timestamps,
		name: text("name").notNull(),
		size: integer("size").notNull(),
		type: text("type").notNull(),
		url: text("url").notNull()
	},
	(table) => ({
		nameIndex: index("files_name_idx").on(table.name)
	})
)

export const messages = createTable(
	"message",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		type: text("type").notNull().$type<"email" | "widget" | "staff">(),
		...timestamps,
		customerId: char("customer_id", { length: 24 }).references(
			() => customers.id
		),
		userClerkId: text("user_clerk_id").references(() => users.clerkId),
		fileId: char("file_id", { length: 24 }).references(() => files.id),
		threadId: char("thread_id", { length: 24 })
			.notNull()
			.references(() => threads.id),
		messageId: text("message_id").unique(),
		content: text("content").notNull()
	},
	(table) => ({
		staffCheck: check(
			"check_staff_constraint",
			sql`${table.type} = 'staff' AND ${table.userClerkId} IS NOT NULL AND ${table.customerId} IS NULL`
		),
		notStaffCheck: check(
			"check_not_staff_constraint",
			sql`${table.type} != 'staff' AND ${table.userClerkId} IS NULL AND ${table.customerId} IS NOT NULL`
		),
		customerMatchCheck: check(
			"check_customer_match_constraint",
			sql`(${table.type} = 'staff') OR (${table.customerId} = (SELECT ${threads.customerId} FROM ${threads} WHERE id = ${table.threadId}))`
		),
		emailCheck: check(
			"check_email_constraint",
			sql`${table.type} = 'email' AND ${table.messageId} IS NOT NULL AND ${table.userClerkId} IS NULL`
		),
		widgetCheck: check(
			"check_widget_constraint",
			sql`${table.type} = 'widget' AND ${table.messageId} IS NULL AND ${table.userClerkId} IS NULL`
		),
		threadIdIndex: index("messages_thread_id_idx").on(table.threadId),
		customerIdIndex: index("messages_customer_id_idx").on(table.customerId),
		userClerkIdIndex: index("messages_user_clerk_id_idx").on(table.userClerkId),
		typeIndex: index("messages_type_idx").on(table.type)
	})
)

export const threads = createTable(
	"thread",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		...timestamps,
		customerId: char("customer_id", { length: 24 })
			.notNull()
			.references(() => customers.id),
		problemId: char("problem_id", { length: 24 }),
		assignedToClerkId: text("assigned_to_clerk_id").references(
			() => users.clerkId
		),
		priority: text("priority")
			.notNull()
			.$type<"urgent" | "non-urgent">()
			.default("non-urgent"),
		status: text("status")
			.notNull()
			.$type<"open" | "closed" | "spam">()
			.default("open"),
		subject: text("subject").notNull(),
		lastReadAt: timestamp("last_read_at")
			.notNull()
			.$default(() => new Date()),
		assignedAt: timestamp("assigned_at"),
		statusChangedAt: timestamp("status_changed_at")
			.notNull()
			.$default(() => new Date())
	},
	(table) => ({
		assignedToClerkIdIndex: index("threads_assigned_to_clerk_id_idx").on(
			table.assignedToClerkId
		),
		customerIdIndex: index("threads_customer_id_idx").on(table.customerId),
		problemIdIndex: index("threads_problem_id_idx").on(table.problemId),
		priorityIndex: index("threads_priority_idx").on(table.priority),
		statusIndex: index("threads_status_idx").on(table.status),
		assignedAtNullCheck: check(
			"assigned_at_null_check",
			sql`(
				(${table.assignedToClerkId} IS NULL AND ${table.assignedAt} IS NULL)
				OR
				(${table.assignedToClerkId} IS NOT NULL AND ${table.assignedAt} IS NOT NULL)
			)`
		),
		statusChangedAtCheck: check(
			"status_changed_at_check",
			sql`${table.statusChangedAt} >= ${table.createdAt}`
		)
	})
)

export const teams = createTable(
	"team",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		...timestamps,
		name: text("name").notNull().unique()
	},
	(table) => ({
		nameIndex: index("teams_name_idx").on(table.name)
	})
)

export const problems = createTable(
	"problem",
	{
		id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
		...timestamps,
		description: text("description").notNull(),
		title: text("title").notNull().unique(),
		teamId: char("team_id", { length: 24 }).references(() => teams.id)
	},
	(table) => ({
		titleIndex: index("problems_title_idx").on(table.title),
		teamIdIndex: index("problems_team_id_idx").on(table.teamId)
	})
)

export const threadsRelations = relations(threads, ({ many, one }) => ({
	messages: many(messages),
	customer: one(customers, {
		fields: [threads.customerId],
		references: [customers.id]
	}),
	problem: one(problems, {
		fields: [threads.problemId],
		references: [problems.id]
	})
}))

export const messagesRelations = relations(messages, ({ one }) => ({
	thread: one(threads, {
		fields: [messages.threadId],
		references: [threads.id]
	}),
	user: one(users, {
		fields: [messages.userClerkId],
		references: [users.clerkId]
	}),
	customer: one(customers, {
		fields: [messages.customerId],
		references: [customers.id]
	}),
	file: one(files, {
		fields: [messages.fileId],
		references: [files.id]
	})
}))

export const teamsRelations = relations(teams, ({ many }) => ({
	users: many(users),
	problems: many(problems)
}))

export const problemsRelations = relations(problems, ({ one }) => ({
	team: one(teams, {
		fields: [problems.teamId],
		references: [teams.id]
	})
}))

export const usersRelations = relations(users, ({ one }) => ({
	team: one(teams, {
		fields: [users.teamId],
		references: [teams.id]
	})
}))
