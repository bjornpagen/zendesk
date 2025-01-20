export interface Message {
	id: string
	author: "customer" | "agent"
	body: string
	createdAt: Date
}

export interface Thread {
	id: string
	customerName: string
	subject: string
	status: "open" | "closed" | "spam"
	problem: string
	priority: "urgent" | "non-urgent"
	isRead: boolean
	messages: Message[]
}

export interface TeamMember {
	id: string
	name: string
	email: string
	avatar: string
	createdAt: Date
	team: string
}

function generateRandomDate(start: Date, end: Date) {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime())
	)
}

function generateMessages(count: number, threadId: string): Message[] {
	const messages: Message[] = []
	const startDate = new Date(2023, 5, 1) // June 1, 2023
	const endDate = new Date() // Current date

	for (let i = 0; i < count; i++) {
		messages.push({
			id: `${threadId}-${i}`,
			author: i % 2 === 0 ? "customer" : "agent",
			body: `This is message ${i + 1} in thread ${threadId}. ${Lorem.generateSentences(3)}`,
			createdAt: generateRandomDate(startDate, endDate)
		})
	}

	return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

// Lorem Ipsum generator
const Lorem = {
	words: [
		"lorem",
		"ipsum",
		"dolor",
		"sit",
		"amet",
		"consectetur",
		"adipiscing",
		"elit",
		"sed",
		"do",
		"eiusmod",
		"tempor",
		"incididunt",
		"ut",
		"labore",
		"et",
		"dolore",
		"magna",
		"aliqua",
		"enim",
		"ad",
		"minim",
		"veniam",
		"quis",
		"nostrud",
		"exercitation",
		"ullamco",
		"laboris",
		"nisi",
		"ut",
		"aliquip",
		"ex",
		"ea",
		"commodo",
		"consequat",
		"duis",
		"aute",
		"irure",
		"dolor",
		"in",
		"reprehenderit",
		"in",
		"voluptate",
		"velit",
		"esse",
		"cillum",
		"dolore",
		"eu",
		"fugiat",
		"nulla",
		"pariatur",
		"excepteur",
		"sint",
		"occaecat",
		"cupidatat",
		"non",
		"proident",
		"sunt",
		"in",
		"culpa",
		"qui",
		"officia",
		"deserunt",
		"mollit",
		"anim",
		"id",
		"est",
		"laborum"
	],
	generateSentences(count: number): string {
		const sentences = []
		for (let i = 0; i < count; i++) {
			const wordCount = Math.floor(Math.random() * 10) + 5 // 5 to 14 words per sentence
			const sentence = this.words
				.sort(() => 0.5 - Math.random())
				.slice(0, wordCount)
				.join(" ")
			sentences.push(`${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`)
		}
		return sentences.join(" ")
	}
}

export const mockThreads: Thread[] = [
	{
		id: "1",
		customerName: "John Doe",
		subject: "Password Reset Issue",
		status: "open",
		problem: "password-reset",
		priority: "urgent",
		isRead: false,
		messages: generateMessages(15, "1")
	},
	{
		id: "2",
		customerName: "Jane Smith",
		subject: "Double Charge on Subscription",
		status: "open",
		problem: "billing-issue",
		priority: "urgent",
		isRead: true,
		messages: generateMessages(8, "2")
	},
	{
		id: "3",
		customerName: "Bob Johnson",
		subject: "Feature Request: Dark Mode",
		status: "closed",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: false,
		messages: generateMessages(12, "3")
	},
	{
		id: "4",
		customerName: "Alice Brown",
		subject: "Mobile App Crash on Startup",
		status: "open",
		problem: "account-access",
		priority: "urgent",
		isRead: true,
		messages: generateMessages(20, "4")
	},
	{
		id: "5",
		customerName: "Charlie Wilson",
		subject: "Data Export Functionality",
		status: "open",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: false,
		messages: generateMessages(10, "5")
	},
	{
		id: "6",
		customerName: "Emma Thompson",
		subject: "Unable to Access Premium Features",
		status: "open",
		problem: "account-access",
		priority: "urgent",
		isRead: true,
		messages: generateMessages(18, "6")
	},
	{
		id: "7",
		customerName: "David Chen",
		subject: "Integration with Third-party API",
		status: "closed",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: true,
		messages: generateMessages(25, "7")
	},
	{
		id: "8",
		customerName: "Sarah Miller",
		subject: "Suspicious Login Attempt",
		status: "spam",
		problem: "account-access",
		priority: "urgent",
		isRead: false,
		messages: generateMessages(5, "8")
	},
	{
		id: "9",
		customerName: "Michael Rodriguez",
		subject: "Mobile App Notifications Not Working",
		status: "open",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: false,
		messages: generateMessages(14, "9")
	},
	{
		id: "10",
		customerName: "Lisa Wang",
		subject: "Subscription Renewal Issue",
		status: "open",
		problem: "billing-issue",
		priority: "urgent",
		isRead: true,
		messages: generateMessages(22, "10")
	},
	{
		id: "11",
		customerName: "James Wilson",
		subject: "Data Export Format Request",
		status: "closed",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: true,
		messages: generateMessages(9, "11")
	},
	{
		id: "12",
		customerName: "Anna Kowalski",
		subject: "Account Verification Failed",
		status: "open",
		problem: "account-access",
		priority: "urgent",
		isRead: false,
		messages: generateMessages(16, "12")
	},
	{
		id: "13",
		customerName: "Robert Taylor",
		subject: "API Documentation Feedback",
		status: "closed",
		problem: "feature-request",
		priority: "non-urgent",
		isRead: true,
		messages: generateMessages(11, "13")
	},
	{
		id: "14",
		customerName: "Sophie Martin",
		subject: "Unauthorized Payment Charge",
		status: "open",
		problem: "billing-issue",
		priority: "urgent",
		isRead: false,
		messages: generateMessages(7, "14")
	},
	{
		id: "15",
		customerName: "Kevin O'Brien",
		subject: "Two-Factor Authentication Setup",
		status: "open",
		problem: "account-access",
		priority: "urgent",
		isRead: true,
		messages: generateMessages(13, "15")
	}
]

export const mockTeamMembers: TeamMember[] = [
	{
		id: "1",
		name: "Sarah Johnson",
		email: "sarah.j@company.com",
		avatar: "/team/avatar-1.png",
		createdAt: generateRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 30)),
		team: "privacy"
	},
	{
		id: "2",
		name: "Michael Chen",
		email: "michael.c@company.com",
		avatar: "/team/avatar-2.png",
		createdAt: generateRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 30)),
		team: "security"
	},
	{
		id: "3",
		name: "Emily Rodriguez",
		email: "emily.r@company.com",
		avatar: "/team/avatar-3.png",
		createdAt: generateRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 30)),
		team: "privacy"
	},
	{
		id: "4",
		name: "James Wilson",
		email: "james.w@company.com",
		avatar: "/team/avatar-4.png",
		createdAt: generateRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 30)),
		team: "security"
	},
	{
		id: "5",
		name: "Lisa Wang",
		email: "lisa.w@company.com",
		avatar: "/team/avatar-5.png",
		createdAt: generateRandomDate(new Date(2023, 0, 1), new Date(2023, 5, 30)),
		team: "privacy"
	}
]
