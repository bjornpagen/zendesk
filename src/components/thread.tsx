"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle
} from "@/components/ui/sheet"
import { mockThreads, type Thread as ThreadType } from "@/types/frontend"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Paperclip, ArrowUp } from "lucide-react"
import { ChangeThreadPropertyDialog } from "@/components/change-thread-property-dialog"
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
	const [thread, setThread] = useState<ThreadType | null>(null)
	const [message, setMessage] = useState("")
	const searchParams = useSearchParams()
	const messageId = searchParams.get("message")
	const [highlightedMessageId, setHighlightedMessageId] = useState<
		string | null
	>(null)
	const [changePropertyDialog, setChangePropertyDialog] = useState<{
		isOpen: boolean
		propertyType: "status" | "priority" | "problem"
	}>({ isOpen: false, propertyType: "status" })

	useEffect(() => {
		const threadId = params.id as string
		const foundThread = mockThreads.find((t) => t.id === threadId)
		setThread(foundThread || null)

		if (foundThread && messageId) {
			const targetMessageId = messageId
			setHighlightedMessageId(targetMessageId)

			setTimeout(() => {
				const targetElement = document.getElementById(
					`message-${targetMessageId}`
				)
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
				}

				// Remove highlight after 1 second
				setTimeout(() => {
					setHighlightedMessageId(null)
				}, 1000)
			}, 100)
		}
	}, [params.id, messageId])

	const handleClose = () => {
		router.back()
	}

	const handleSend = () => {
		if (!message.trim()) {
			return
		}
		// Handle sending message here
		setMessage("")
	}

	const handleChangeProperty = (
		propertyType: "status" | "priority" | "problem"
	) => {
		setChangePropertyDialog({ isOpen: true, propertyType })
	}

	const handlePropertyChange = (newValue: string) => {
		if (thread) {
			const updatedThread = {
				...thread,
				[changePropertyDialog.propertyType]: newValue
			}
			setThread(updatedThread)
			// Here you would typically update the thread in your backend
		}
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
						<span className="font-medium">{thread.customerName}</span>
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
							{thread.problem.replace("-", " ")}
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
											message.author === "customer"
												? "/placeholder.svg"
												: "/agent-placeholder.svg"
										}
									/>
									<AvatarFallback>
										{message.author === "customer" ? "C" : "A"}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<p className="text-sm font-medium">
										{message.author === "customer"
											? thread.customerName
											: "Support Agent"}
									</p>
									<p className="text-xs text-muted-foreground mb-1">
										{formatDate(message.createdAt)}
									</p>
									<p className="text-sm">{message.body}</p>
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
				currentValue={thread[changePropertyDialog.propertyType]}
				onChangeProperty={handlePropertyChange}
			/>
		</Sheet>
	)
}
