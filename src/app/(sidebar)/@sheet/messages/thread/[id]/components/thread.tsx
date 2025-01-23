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
import { Paperclip, ArrowUp, X, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ChangeThreadPropertyDialog } from "./change-thread-property-dialog"
import { formatDate } from "@/lib/format"
import {
	addMetadataField,
	updateMetadataField,
	deleteMetadataField
} from "@/server/actions/metadata"
import { getCustomerMetadata } from "@/server/actions/metadata"

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
	const [isAddMetadataOpen, setIsAddMetadataOpen] = useState(false)
	const [isEditMetadataOpen, setIsEditMetadataOpen] = useState<string | null>(
		null
	)

	const { data: thread, mutate } = useSWR(
		params.id ? ["thread", params.id] : null,
		() => getThread(params.id as string)
	)

	const { data: customerMetadata, mutate: mutateMetadata } = useSWR(
		thread?.customer?.id ? ["customerMetadata", thread.customer.id] : null,
		([_, id]) => getCustomerMetadata(id)
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

	const handlePropertyChange = async () => {
		await mutate()
		await mutateMetadata()
	}

	const handleAddMetadata = async (key: string, value: string) => {
		if (!thread) {
			return
		}

		try {
			await addMetadataField(thread.customer.id, key, value)
			await mutateMetadata()
			setIsAddMetadataOpen(false)
		} catch (error) {
			console.error("Failed to add metadata:", error)
		}
	}

	const handleUpdateMetadata = async (key: string, value: string) => {
		if (!thread) {
			return
		}

		try {
			await updateMetadataField(thread.customer.id, key, value)
			await mutateMetadata()
			setIsEditMetadataOpen(null)
		} catch (error) {
			console.error("Failed to update metadata:", error)
		}
	}

	const handleDeleteMetadata = async (key: string) => {
		if (!thread) {
			return
		}

		try {
			await deleteMetadataField(thread.customer.id, key)
			await mutateMetadata()
		} catch (error) {
			console.error("Failed to delete metadata:", error)
		}
	}

	if (!thread) {
		return null
	}

	return (
		<Sheet defaultOpen open onOpenChange={handleClose}>
			<SheetContent className="sm:max-w-[1200px] p-0 flex">
				<div className="w-[350px] flex flex-col bg-muted">
					<div className="w-full flex flex-col h-full">
						<div className="p-4 border-b">
							<SheetHeader className="mb-4">
								<SheetTitle className="text-lg">Customer Details</SheetTitle>
							</SheetHeader>

							<div className="space-y-2">
								<div>
									<Label className="text-xs text-muted-foreground">Name</Label>
									<div className="text-sm font-medium">
										{thread.customer?.name}
									</div>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Email</Label>
									<div className="text-sm font-medium">
										{thread.customer?.email}
									</div>
								</div>
							</div>
						</div>

						<ScrollArea className="flex-1 px-4 pt-4">
							<div className="space-y-2 pb-4">
								{customerMetadata &&
									Object.entries(customerMetadata).map(([key, value]) => (
										<div key={key} className="group">
											<Label className="text-xs text-muted-foreground capitalize">
												{key}
											</Label>
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium truncate max-w-[230px]">
													{value}
												</span>
												<div className="flex items-center opacity-0 group-hover:opacity-100">
													<Dialog
														open={isEditMetadataOpen === key}
														onOpenChange={() => setIsEditMetadataOpen(null)}
													>
														<DialogTrigger
															asChild
															onClick={(e) => {
																e.preventDefault()
																setIsEditMetadataOpen(key)
															}}
														>
															<Button
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0"
															>
																<Pencil className="h-3 w-3" />
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Edit {key}</DialogTitle>
															</DialogHeader>
															<form
																onSubmit={async (e) => {
																	e.preventDefault()
																	const formData = new FormData(e.currentTarget)
																	const newValue = formData.get(
																		"value"
																	) as string
																	await handleUpdateMetadata(key, newValue)
																}}
															>
																<div className="py-4">
																	<Label htmlFor={`edit-${key}`}>Value</Label>
																	<Input
																		id={`edit-${key}`}
																		name="value"
																		defaultValue={value}
																		className="mt-2"
																	/>
																</div>
																<DialogFooter>
																	<Button type="submit">Save changes</Button>
																</DialogFooter>
															</form>
														</DialogContent>
													</Dialog>
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 text-destructive"
														onClick={() => handleDeleteMetadata(key)}
													>
														<X className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</div>
									))}
							</div>
						</ScrollArea>

						<div className="p-4 pt-2 border-t">
							<Dialog
								open={isAddMetadataOpen}
								onOpenChange={setIsAddMetadataOpen}
							>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full">
										<Plus className="h-4 w-4 mr-2" />
										Add Metadata
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Add Metadata Field</DialogTitle>
									</DialogHeader>
									<form
										onSubmit={async (e) => {
											e.preventDefault()
											const formData = new FormData(e.currentTarget)
											const key = formData.get("key") as string
											const value = formData.get("value") as string
											await handleAddMetadata(key, value)
										}}
									>
										<div className="space-y-4 py-4">
											<div>
												<Label htmlFor="key">Field Name</Label>
												<Input
													id="key"
													name="key"
													placeholder="Enter field name"
													className="mt-2"
												/>
											</div>
											<div>
												<Label htmlFor="value">Value</Label>
												<Input
													id="value"
													name="value"
													placeholder="Enter value"
													className="mt-2"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit">Add Field</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
				<div className="flex-1 flex flex-col">
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
