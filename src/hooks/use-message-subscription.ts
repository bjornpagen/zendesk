import { useEffect } from "react"
import { createClient, type RealtimeChannel } from "@supabase/supabase-js"
import { env } from "@/env"

// Create a single instance of the Supabase client
const supabase = createClient(
	env.NEXT_PUBLIC_SUPABASE_URL,
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

type MessageInsert = {
	id: string
}

export function useMessageSubscription(
	threadId: string,
	onNewMessage?: (messageId: string) => void
) {
	useEffect(() => {
		let channel: RealtimeChannel | null = null

		try {
			channel = supabase
				.channel("messages")
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "zendesk_message",
						filter: `thread_id=eq.${threadId}`
					},
					(payload) => {
						if (onNewMessage) {
							onNewMessage((payload.new as MessageInsert).id)
						}
					}
				)
				.subscribe()
		} catch (error) {
			console.error("Error subscribing to messages:", error)
		}

		return () => {
			if (channel) {
				supabase.removeChannel(channel)
			}
		}
	}, [onNewMessage, threadId])
}
