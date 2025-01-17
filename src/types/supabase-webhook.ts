type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
	? T extends Capitalize<T>
		? `_${Lowercase<T>}${CamelToSnakeCase<U>}`
		: `${T}${CamelToSnakeCase<U>}`
	: S

type ConvertKeysToSnakeCase<T> = T extends object
	? {
			// biome-ignore lint/complexity/noBannedTypes: Function type is required for type manipulation
			[K in keyof T as T[K] extends Function
				? never
				: CamelToSnakeCase<string & K>]: T[K] extends object
				? ConvertKeysToSnakeCase<T[K]>
				: T[K]
		}
	: T

export type InsertPayload<T> = {
	type: "INSERT"
	table: string
	schema: string
	record: ConvertKeysToSnakeCase<T>
	old_record: null
}

export type UpdatePayload<T> = {
	type: "UPDATE"
	table: string
	schema: string
	record: ConvertKeysToSnakeCase<T>
	old_record: ConvertKeysToSnakeCase<T>
}

export type DeletePayload<T> = {
	type: "DELETE"
	table: string
	schema: string
	record: null
	old_record: ConvertKeysToSnakeCase<T>
}

export type Payload<T> = InsertPayload<T> | UpdatePayload<T> | DeletePayload<T>
