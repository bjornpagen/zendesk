"use server"

import { db } from "@/server/db"
import * as schema from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

const MetadataSchema = z.object({
	key: z.string().min(1),
	value: z.string().min(1)
})

/**
 * Add a new metadata field to a customer
 */
export async function addMetadataField(
	customerId: string,
	key: string,
	value: string
) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Validate input
	const validation = MetadataSchema.safeParse({ key, value })
	if (!validation.success) {
		throw new Error("Invalid input")
	}

	// Get current metadata
	const customer = await db.query.customers.findFirst({
		where: eq(schema.customers.id, customerId),
		columns: {
			metadata: true
		}
	})

	if (!customer) {
		throw new Error("Customer not found")
	}

	// Add new field to metadata
	const updatedMetadata = {
		...customer.metadata,
		[key]: value
	}

	// Update customer record
	const [updatedCustomer] = await db
		.update(schema.customers)
		.set({
			metadata: updatedMetadata
		})
		.where(eq(schema.customers.id, customerId))
		.returning({
			metadata: schema.customers.metadata
		})

	return updatedCustomer
}

/**
 * Update an existing metadata field
 */
export async function updateMetadataField(
	customerId: string,
	key: string,
	value: string
) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Validate input
	const validation = MetadataSchema.safeParse({ key, value })
	if (!validation.success) {
		throw new Error("Invalid input")
	}

	// Get current metadata
	const customer = await db.query.customers.findFirst({
		where: eq(schema.customers.id, customerId),
		columns: {
			metadata: true
		}
	})

	if (!customer) {
		throw new Error("Customer not found")
	}

	// Ensure field exists
	if (!(key in customer.metadata)) {
		throw new Error("Metadata field not found")
	}

	// Update field in metadata
	const updatedMetadata = {
		...customer.metadata,
		[key]: value
	}

	// Update customer record
	const [updatedCustomer] = await db
		.update(schema.customers)
		.set({
			metadata: updatedMetadata
		})
		.where(eq(schema.customers.id, customerId))
		.returning({
			metadata: schema.customers.metadata
		})

	return updatedCustomer
}

/**
 * Delete a metadata field
 */
export async function deleteMetadataField(customerId: string, key: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	// Get current metadata
	const customer = await db.query.customers.findFirst({
		where: eq(schema.customers.id, customerId),
		columns: {
			metadata: true
		}
	})

	if (!customer) {
		throw new Error("Customer not found")
	}

	// Ensure field exists
	if (!(key in customer.metadata)) {
		throw new Error("Metadata field not found")
	}

	// Create new metadata object without the specified key
	const { [key]: _, ...updatedMetadata } = customer.metadata

	// Update customer record
	const [updatedCustomer] = await db
		.update(schema.customers)
		.set({
			metadata: updatedMetadata
		})
		.where(eq(schema.customers.id, customerId))
		.returning({
			metadata: schema.customers.metadata
		})

	return updatedCustomer
}

/**
 * Get all metadata for a customer
 */
export async function getCustomerMetadata(customerId: string) {
	const { userId: clerkId } = await auth()
	if (!clerkId) {
		throw new Error("Unauthorized")
	}

	const customer = await db.query.customers.findFirst({
		where: eq(schema.customers.id, customerId),
		columns: {
			metadata: true
		}
	})

	if (!customer) {
		throw new Error("Customer not found")
	}

	return customer.metadata
}
