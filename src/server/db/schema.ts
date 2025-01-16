import { createId } from "@paralleldrive/cuid2"
import { char, pgTableCreator, timestamp } from "drizzle-orm/pg-core"

export const createTable = pgTableCreator((name) => `zendesk_${name}`)

export const posts = createTable("post", {
	id: char("id", { length: 24 }).primaryKey().notNull().$default(createId),
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$default(() => new Date())
		.$onUpdate(() => new Date())
})
