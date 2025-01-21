"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { getThread, sendMessage } from "@/server/actions/thread"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, ArrowUp } from "lucide-react"

import { ChangeThreadPropertyDialog } from "./change-thread-property-dialog"
import { formatDate } from "@/lib/format"

const getStatusVariant = (status: string) => {
	switch (status) {
		case "open":
			return "default"
		case "closed":
			return "secondary"
		case "spam":
			return "destructive"
		default:
			return "default"
	}
}

const getPriorityVariant = (priority: string) => {
	switch (priority) {
		case "urgent":
			return "destructive"
		case "non-urgent":
			return "secondary"
		default:
			return "default"
	}
}

const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function Thread() {
	const params = useParams()
	const router = useRouter()
	const searchParams = useSearchParams()
	const messageId = searchParams.get("message")
	const [message, setMessage] = useState("")
	const [highlightedMessageId, setHighlightedMessageId] = useState<
		string | null
	>(null)
	const [changePropertyDialog, setChangePropertyDialog] = useState<{
		isOpen: boolean
		propertyType: "status" | "priority" | "problem"
	}>({ isOpen: false, propertyType: "status" })

	const { data: thread, mutate } = useSWR(
		params.id ? ["thread", params.id] : null,
		() => getThread(params.id as string)
	)

	useEffect(() => {
		if (thread && messageId) {
			const targetMessageId = messageId
			setHighlightedMessageId(targetMessageId)

			setTimeout(() => {
				const targetElement = document.getElementById(
					`message-${targetMessageId}`
				)
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
				}

				setTimeout(() => {
					setHighlightedMessageId(null)
				}, 1000)
			}, 100)
		}
	}, [thread, messageId])

	const handleClose = () => {
		router.back()
	}

	const handleSend = async () => {
		if (!message.trim() || !thread) {
			return
		}

		try {
			await sendMessage(thread.id, message.trim())
			setMessage("")
			// Refresh the thread data to show the new message
			await mutate()
		} catch (error) {
			console.error("Failed to send message:", error)
			// You might want to add some error handling UI here
		}
	}

	const handleChangeProperty = (
		propertyType: "status" | "priority" | "problem"
	) => {
		setChangePropertyDialog({ isOpen: true, propertyType })
	}

	const handlePropertyChange = (newValue: string) => {
		// TODO: Implement server action to update thread properties
		// For now, we'll rely on revalidation from useSWR
	}

	if (!thread) {
		return null
	}

	return (
		<Sheet defaultOpen open onOpenChange={handleClose}>
			<SheetContent className="sm:max-w-[500px] p-0 flex flex-col">
				<div className="px-4 pt-4 space-y-4">
					<SheetHeader className="mb-4">
						<SheetTitle>{thread.subject}</SheetTitle>
					</SheetHeader>
					<div className="flex items-center space-x-2 text-sm">
						<span className="font-medium">{thread.customer.name}</span>
						<span>•</span>
						<Badge
							variant={getStatusVariant(thread.status)}
							className="cursor-pointer"
							onClick={() => handleChangeProperty("status")}
						>
							{capitalizeFirstLetter(thread.status)}
						</Badge>
						<span>•</span>
						<Badge
							variant={getPriorityVariant(thread.priority)}
							className="capitalize cursor-pointer"
							onClick={() => handleChangeProperty("priority")}
						>
							{thread.priority}
						</Badge>
						<span>•</span>
						<Badge
							variant="outline"
							className="capitalize cursor-pointer"
							onClick={() => handleChangeProperty("problem")}
						>
							{thread.problem?.title || "No Problem"}
						</Badge>
					</div>
				</div>
				<ScrollArea
					className="flex-1 border-t border-b"
					id="message-scroll-area"
				>
					<div className="space-y-0">
						{thread.messages.map((message) => (
							<div
								key={message.id}
								id={`message-${message.id}`}
								className={`flex gap-3 p-3 transition-colors duration-300 ${
									highlightedMessageId === message.id ? "bg-muted" : ""
								}`}
							>
								<Avatar>
									<AvatarImage
										src={
											message.type === "staff"
												? message.user?.avatar
												: "/placeholder.svg"
										}
									/>
									<AvatarFallback>
										{message.type === "staff"
											? message.user?.name?.charAt(0) || "A"
											: thread.customer.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<p className="text-sm font-medium">
										{message.type === "staff"
											? message.user?.name || "Support Agent"
											: thread.customer.name}
									</p>
									<p className="text-xs text-muted-foreground mb-1">
										{formatDate(message.createdAt)}
									</p>
									<p className="text-sm">{message.content}</p>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
				<div className="px-4 pb-4">
					<div className="relative">
						<Textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Write a message..."
							className="min-h-[44px] w-full bg-secondary text-secondary-foreground pr-12 resize-none"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault()
									handleSend()
								}
							}}
						/>
						<div className="absolute right-3 top-3 flex items-center gap-2">
							<Button
								size="icon"
								variant="ghost"
								className="h-6 w-6 text-muted-foreground hover:text-secondary-foreground"
							>
								<Paperclip className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								className="h-6 w-6 text-muted-foreground hover:text-secondary-foreground"
								onClick={handleSend}
							>
								<ArrowUp className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</SheetContent>
			<ChangeThreadPropertyDialog
				isOpen={changePropertyDialog.isOpen}
				onClose={() =>
					setChangePropertyDialog({ ...changePropertyDialog, isOpen: false })
				}
				propertyType={changePropertyDialog.propertyType}
				currentValue={
					changePropertyDialog.propertyType === "problem"
						? (thread.problem?.title ?? "")
						: (thread[changePropertyDialog.propertyType] as string)
				}
				onChangeProperty={handlePropertyChange}
			/>
		</Sheet>
	)
}
