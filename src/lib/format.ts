/**
 * Format a date to a readable string
 * @param date Date to format
 * @param options Optional Intl.DateTimeFormatOptions
 */
export function formatDate(
	date: Date | string | number,
	options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric"
	}
): string {
	const d = new Date(date)
	return new Intl.DateTimeFormat(undefined, options).format(d)
}

/**
 * Format a number with thousand separators
 * @param num Number to format
 * @param decimals Number of decimal places (default: 0)
 */
export function formatNumber(num: number, decimals = 0): string {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(num)
}

/**
 * Truncate text with ellipsis if it exceeds maxLength
 * @param text Text to truncate
 * @param maxLength Maximum length before truncating
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text
	}
	return `${text.slice(0, maxLength)}...`
}

/**
 * Convert bytes to human readable size
 * @param bytes Number of bytes
 */
export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"]
	let size = bytes
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}

	return `${formatNumber(size, 1)} ${units[unitIndex]}`
}

/**
 * Format a time to a readable string based on locale (e.g., "2:30 PM" for en-US or "14:30" for most EU)
 * @param date Date to format
 */
export function formatTime(date: Date): string {
	return new Intl.DateTimeFormat(undefined, {
		hour: "numeric",
		minute: "2-digit"
	}).format(date)
}

/**
 * Format milliseconds into a human readable duration string
 * @param ms Number of milliseconds
 * @param compact If true, only shows largest non-zero unit (e.g., "2h" instead of "2h 30m 15s")
 */
export function formatDuration(ms: number, compact = false): string {
	if (ms === 0) {
		return "0s"
	}

	const units = {
		d: Math.floor(ms / (1000 * 60 * 60 * 24)),
		h: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
		m: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
		s: Math.floor((ms % (1000 * 60)) / 1000)
	}

	const parts = Object.entries(units)
		.filter(([_, value]) => value > 0)
		.map(([unit, value]) => `${value}${unit}`)

	if (compact && parts.length > 0) {
		return parts[0] ?? "0s"
	}

	return parts.join(" ") ?? "0s"
}
