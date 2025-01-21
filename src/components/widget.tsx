"use client"

import { useState } from "react"
import useSWR from "swr"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare, Paperclip, ArrowUp, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/format"
import {
	getWidgetThread,
	getWidgetThreads,
	sendWidgetMessage,
	createWidgetThread
} from "@/server/actions/widget"

interface Message {
	id: string
	content: string
	createdAt: Date
	type: string
}

interface Thread {
	id: string
	subject: string
	messages: Message[]
	customer: {
		name: string
	}
}

export function Widget() {
	const [isOpen, setIsOpen] = useState(false)
	const [message, setMessage] = useState("")
	const [activeThread, setActiveThread] = useState<string | null>(null)

	const { data: threads, mutate: mutateThreads } = useSWR(
		"widget-threads",
		getWidgetThreads
	)

	const { data: activeThreadData, mutate: mutateActiveThread } = useSWR(
		activeThread ? ["widget-thread", activeThread] : null,
		([_, id]) => getWidgetThread(id)
	)

	const handleSend = async () => {
		if (!message.trim() || !activeThread) {
			return
		}

		try {
			await sendWidgetMessage(message.trim(), activeThread)
			setMessage("")
			await mutateActiveThread()
			await mutateThreads()
		} catch (error) {
			console.error("Failed to send message:", error)
		}
	}

	const handleNewThread = async () => {
		const thread = await createWidgetThread()
		if (thread) {
			setActiveThread(thread.id)
			await mutateThreads()
		}
	}

	const isUserMessage = (type: string) => type === "widget"

	return (
		<>
			{!isOpen && (
				<Button
					className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
					onClick={() => setIsOpen(true)}
				>
					<MessageSquare className="h-6 w-6" />
				</Button>
			)}

			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetContent
					side="right"
					className="w-[100vw] sm:w-[400px] p-0 flex flex-col h-[600px] sm:h-[500px] rounded-t-lg sm:rounded-lg fixed bottom-0 right-0 sm:bottom-4 sm:right-4 shadow-2xl"
				>
					<div className="p-4 border-b flex items-center justify-between">
						<div className="flex items-center gap-2">
							{activeThread && (
								<Button
									variant="ghost"
									size="icon"
									className="mr-2"
									onClick={() => setActiveThread(null)}
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							)}
							<Avatar>
								<AvatarImage src="/agent-placeholder.svg" />
								<AvatarFallback>SP</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-semibold">
									{activeThread
										? threads?.find((t) => t.id === activeThread)?.subject
										: "Support Chat"}
								</h3>
								<p className="text-xs text-muted-foreground">
									Typically replies within 5 minutes
								</p>
							</div>
						</div>
					</div>

					{activeThread ? (
						<>
							<ScrollArea className="flex-1 p-4">
								<div className="space-y-4 flex flex-col-reverse">
									{activeThreadData?.messages.map((msg) => (
										<div
											key={msg.id}
											className={`flex gap-3 ${
												isUserMessage(msg.type) ? "flex-row-reverse" : ""
											}`}
										>
											<Avatar className="h-8 w-8">
												<AvatarImage
													src={
														isUserMessage(msg.type)
															? "/placeholder.svg"
															: "/agent-placeholder.svg"
													}
												/>
												<AvatarFallback>
													{isUserMessage(msg.type) ? "U" : "A"}
												</AvatarFallback>
											</Avatar>
											<div
												className={`rounded-lg p-3 max-w-[80%] ${
													isUserMessage(msg.type)
														? "bg-primary text-primary-foreground"
														: "bg-muted"
												}`}
											>
												<p className="text-sm">{msg.content}</p>
												<p className="text-xs opacity-70 mt-1">
													{formatDate(msg.createdAt)}
												</p>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>

							<div className="p-4 border-t">
								<div className="relative">
									<Textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder="Send a message..."
										className="min-h-[44px] w-full pr-12 resize-none"
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
											className="h-6 w-6 text-muted-foreground hover:text-foreground"
										>
											<Paperclip className="h-4 w-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											className="h-6 w-6 text-muted-foreground hover:text-foreground"
											onClick={handleSend}
										>
											<ArrowUp className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						</>
					) : (
						<ScrollArea className="flex-1">
							<div className="p-4 space-y-4">
								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={handleNewThread}
								>
									<MessageSquare className="h-4 w-4 mr-2" />
									Start New Conversation
								</Button>
								{threads?.map((thread) => (
									<div
										key={thread.id}
										className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
										onClick={() => setActiveThread(thread.id)}
									>
										<h4 className="font-medium">{thread.subject}</h4>
										{thread.messages[thread.messages.length - 1] && (
											<p className="text-sm text-muted-foreground line-clamp-1">
												{thread.messages[thread.messages.length - 1]?.content}
											</p>
										)}
										<p className="text-xs text-muted-foreground mt-1">
											{formatDate(
												thread.messages[thread.messages.length - 1]
													?.createdAt || new Date()
											)}
										</p>
									</div>
								))}
							</div>
						</ScrollArea>
					)}
				</SheetContent>
			</Sheet>
		</>
	)
}
