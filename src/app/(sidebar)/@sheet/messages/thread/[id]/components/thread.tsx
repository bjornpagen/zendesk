"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { getThread, sendMessageForm } from "@/server/actions/thread"
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
import { Paperclip, ArrowUp, X } from "lucide-react"

import { ChangeThreadPropertyDialog } from "./change-thread-property-dialog"
import { formatDate } from "@/lib/format"

import Image from "next/image"

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

const MOCK_CUSTOMER_OBJECT = {
	email: "sarah.parker@acme.co",
	name: "Sarah Parker",
	metadata: {
		Company: "Acme Corporation",
		"Phone Number": "+1 (555) 123-4567",
		"Job Title": "Senior Product Manager",
		Location: "San Francisco, CA",
		"Time Zone": "PST",
		"Latest Purchase": "Enterprise Plan - 2024",
		"Account Type": "Enterprise",
		"Customer Since": "2022",
		"Last Login": "2 hours ago",
		"Support Tickets": "12 open, 47 resolved",
		"Billing Status": "Active - Auto-renewal",
		"Payment Method": "Visa ending in 4242",
		"Monthly Revenue": "$12,500",
		"Team Size": "250+ employees",
		Industry: "Software & Technology",
		Website: "acme.corporation.com",
		"Integration Type": "API + Widget",
		"API Usage": "2.3M requests/month",
		"Feature Access": "All Enterprise Features",
		"Contract Term": "36 months",
		"Renewal Date": "Dec 31, 2024",
		CSM: "John Smith",
		"NPS Score": "9/10",
		Language: "English (US)",
		"Security Level": "SOC2 Compliant",
		"2FA Status": "Enabled",
		"Custom Domain": "help.acme.co",
		"Data Center": "US-West",
		"Account Health": "Excellent",
		"Training Status": "Completed",
		"Support SLA": "Premium - 1h response",
		"API Version": "v2.1.4"
	}
}

const renderMetadataField = (key: string, value: string) => {
	return (
		<div key={key} className="flex flex-col space-y-1">
			<dt className="text-sm text-muted-foreground">{key}</dt>
			<dd className="text-sm font-medium">{value}</dd>
		</div>
	)
}

export default function Thread() {
	const params = useParams()
	const router = useRouter()
	const searchParams = useSearchParams()
	const messageId = searchParams.get("message")
	const [message, setMessage] = useState("")
	const [file, setFile] = useState<File | null>(null)
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
					targetElement.scrollIntoView({ behavior: "smooth", block: "end" })
				}

				setTimeout(() => {
					setHighlightedMessageId(null)
				}, 1000)
			}, 100)
		}
	}, [thread, messageId])

	// Add this effect to scroll to bottom when messages change
	useEffect(() => {
		if (!thread?.messages?.length) {
			return
		}

		const scrollArea = document.getElementById("message-scroll-area")
		setTimeout(() => {
			if (scrollArea) {
				scrollArea.scrollTo({
					top: scrollArea.scrollHeight,
					behavior: "smooth"
				})
			}
		}, 10)
	}, [thread?.messages?.length])

	const handleClose = () => {
		router.back()
	}

	const handleFileChoose = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files?.[0]) {
			setFile(event.target.files[0])
		}
	}

	const handleSend = async () => {
		if ((!message.trim() && !file) || !thread) {
			return
		}

		try {
			const formData = new FormData()
			formData.append("content", message.trim())
			formData.append("threadId", thread.id)
			if (file) {
				formData.append("file", file)
			}

			await sendMessageForm(formData)
			setMessage("")
			setFile(null)
			await mutate()

			const scrollArea = document.getElementById("message-scroll-area")
			if (scrollArea) {
				scrollArea.scrollTo({
					top: scrollArea.scrollHeight,
					behavior: "smooth"
				})
			}
		} catch (error) {
			throw new Error("Failed to send message")
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
			<SheetContent className="sm:max-w-[800px] p-0 flex">
				<div className="w-[300px] flex flex-col">
					<div className="p-6">
						<SheetHeader className="mb-6">
							<SheetTitle>Customer Details</SheetTitle>
						</SheetHeader>

						{/* Primary Fields */}
						<div className="mb-6">
							<div className="mb-4">
								<div className="text-sm text-muted-foreground">Name</div>
								<div className="text-sm font-medium">
									{MOCK_CUSTOMER_OBJECT.name}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground">Email</div>
								<div className="text-sm font-medium">
									{MOCK_CUSTOMER_OBJECT.email}
								</div>
							</div>
						</div>
					</div>

					{/* Scrollable Metadata Fields */}
					<ScrollArea className="flex-1 px-6 pb-6">
						<dl className="space-y-4">
							{Object.entries(MOCK_CUSTOMER_OBJECT.metadata).map(
								([key, value]) => renderMetadataField(key, value)
							)}
						</dl>
					</ScrollArea>
				</div>
				<div className="flex-1 flex flex-col border-l">
					<div className="p-4">
						<SheetHeader className="mb-4">
							<SheetTitle>{thread.subject}</SheetTitle>
						</SheetHeader>
						<div className="flex items-center space-x-2 text-sm">
							<Badge
								variant={getStatusVariant(thread.status)}
								className="cursor-pointer"
								onClick={() => handleChangeProperty("status")}
							>
								{capitalizeFirstLetter(thread.status)}
							</Badge>
							<Badge
								variant={getPriorityVariant(thread.priority)}
								className="capitalize cursor-pointer"
								onClick={() => handleChangeProperty("priority")}
							>
								{thread.priority}
							</Badge>
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
												: message.customer?.name?.charAt(0) || "C"}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										<p className="text-sm font-medium">
											{message.type === "staff"
												? message.user?.name || "Support Agent"
												: message.customer?.name || "Customer"}
										</p>
										<p className="text-xs text-muted-foreground mb-1">
											{formatDate(message.createdAt)}
										</p>
										<p className="text-sm">{message.content}</p>
										{message.file?.type.startsWith("image/") && (
											<div className="mt-2 relative w-[200px]">
												<Image
													src={message.file.url}
													alt={message.file.name}
													width={200}
													height={200}
													className="rounded-md"
												/>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
					<div className="p-4">
						{file && (
							<Badge
								variant="secondary"
								className="inline-flex items-center gap-1 mb-3 max-w-[300px] text-xs px-1.5 font-normal"
							>
								<Paperclip className="h-3 w-3 flex-shrink-0" />
								<span className="truncate">{file.name}</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-3 w-3 p-0 hover:bg-transparent flex-shrink-0"
									onClick={() => {
										setFile(null)
										const fileInput = document.getElementById(
											"fileInput"
										) as HTMLInputElement
										if (fileInput) {
											fileInput.value = ""
										}
									}}
								>
									<X className="h-2.5 w-2.5" />
									<span className="sr-only">Remove file</span>
								</Button>
							</Badge>
						)}
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
									onClick={() => document.getElementById("fileInput")?.click()}
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
						<input
							id="fileInput"
							type="file"
							onChange={handleFileChoose}
							className="hidden"
						/>
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
