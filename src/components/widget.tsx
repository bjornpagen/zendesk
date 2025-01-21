"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare, Paperclip, ArrowUp } from "lucide-react"
import { formatDate } from "@/lib/format"

interface Message {
	id: string
	body: string
	author: "user" | "agent"
	createdAt: Date
}

export function Widget() {
	const [isOpen, setIsOpen] = useState(false)
	const [message, setMessage] = useState("")
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			body: "👋 Hi there! How can we help you today?",
			author: "agent",
			createdAt: new Date()
		}
	])

	const handleSend = () => {
		if (!message.trim()) {
			return
		}

		const newMessage: Message = {
			id: Math.random().toString(),
			body: message,
			author: "user",
			createdAt: new Date()
		}

		setMessages([...messages, newMessage])
		setMessage("")

		// Here you would typically send the message to your backend
		// and handle the response
	}

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
					{/* Header */}
					<div className="p-4 border-b flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarImage src="/agent-placeholder.svg" />
								<AvatarFallback>SP</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-semibold">Support Chat</h3>
								<p className="text-xs text-muted-foreground">
									Typically replies within 5 minutes
								</p>
							</div>
						</div>
					</div>

					{/* Messages */}
					<ScrollArea className="flex-1 p-4">
						<div className="space-y-4">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={`flex gap-3 ${
										msg.author === "user" ? "flex-row-reverse" : ""
									}`}
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={
												msg.author === "user"
													? "/placeholder.svg"
													: "/agent-placeholder.svg"
											}
										/>
										<AvatarFallback>
											{msg.author === "user" ? "U" : "A"}
										</AvatarFallback>
									</Avatar>
									<div
										className={`rounded-lg p-3 max-w-[80%] ${
											msg.author === "user"
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}
									>
										<p className="text-sm">{msg.body}</p>
										<p className="text-xs opacity-70 mt-1">
											{formatDate(msg.createdAt)}
										</p>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>

					{/* Input */}
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
				</SheetContent>
			</Sheet>
		</>
	)
}
