import "server-only"

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { env } from "@/env"
import { createId } from "@paralleldrive/cuid2"

const s3Client = new S3Client({
	region: env.AWS_REGION,
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY
	}
})

/**
 * Uploads a file to S3 and returns the public URL
 * @param file The file to upload
 * @param maxSizeInBytes Optional maximum file size in bytes (default: 5MB). Set to 0 to disable size validation
 * @throws {Error} When file size exceeds maxSizeInBytes (if validation is enabled)
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToS3(
	file: File,
	maxSizeInBytes: number = 5 * 1024 * 1024
): Promise<string> {
	// Add file size validation if maxSizeInBytes is provided
	if (maxSizeInBytes > 0 && file.size > maxSizeInBytes) {
		throw new Error(`File size exceeds limit of ${maxSizeInBytes} bytes`)
	}

	const key = createId()

	// Convert File to Uint8Array
	const arrayBuffer = await file.arrayBuffer()
	const uint8Array = new Uint8Array(arrayBuffer)

	// Upload to S3
	const command = new PutObjectCommand({
		Bucket: env.AWS_S3_BUCKET_NAME,
		Key: key,
		Body: uint8Array,
		ContentType: file.type,
		ACL: "public-read"
	})

	await s3Client.send(command)

	// Return the URL
	return `https://s3.${env.AWS_REGION}.amazonaws.com/${env.AWS_S3_BUCKET_NAME}/${key}`
}
