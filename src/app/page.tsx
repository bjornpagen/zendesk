"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
	Moon,
	Sun,
	Mail,
	MessageSquare,
	Users,
	BarChart,
	Shield,
	Zap,
	Globe,
	ArrowRight,
	Inbox,
	Tag,
	AlertTriangle,
	Paperclip,
	PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
	SiFacebook,
	SiSlack,
	SiNetflix,
	SiAirbnb,
	SiSpotify
} from "react-icons/si"

export default function LandingPage() {
	const [theme, setTheme] = useState<"light" | "dark">("dark")
	const { scrollYProgress } = useScroll()
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
	const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light")
		document.documentElement.classList.toggle("dark")
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") || "dark"
		setTheme(savedTheme as "light" | "dark")
		document.documentElement.classList.toggle("dark", savedTheme === "dark")
	}, [])

	useEffect(() => {
		localStorage.setItem("theme", theme)
	}, [theme])

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	}

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1
		}
	}

	return (
		<div
			className={`min-h-screen bg-background text-foreground ${theme === "dark" ? "dark" : ""}`}
		>
			<motion.header
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm"
			>
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold font-display">SupportHub</h1>
					<nav className="hidden md:flex space-x-4">
						<Button variant="ghost">Features</Button>
						<Button variant="ghost">Pricing</Button>
						<Button variant="ghost">About</Button>
						<Button variant="ghost">Contact</Button>
					</nav>
					<div className="flex items-center space-x-4">
						<Button variant="outline" size="icon" onClick={toggleTheme}>
							{theme === "light" ? (
								<Moon className="h-[1.2rem] w-[1.2rem]" />
							) : (
								<Sun className="h-[1.2rem] w-[1.2rem]" />
							)}
						</Button>
						<Button variant="outline" asChild>
							<a href="/sign-in">Sign In</a>
						</Button>
						<Button asChild>
							<a href="/sign-up">Sign Up</a>
						</Button>
					</div>
				</div>
			</motion.header>

			<main className="pt-20">
				<motion.section
					style={{ opacity, scale }}
					className="relative h-screen flex items-center justify-center overflow-hidden"
				>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center z-10"
					>
						<h2 className="text-5xl md:text-7xl font-extrabold font-display mb-6">
							Revolutionize Your <br />
							Customer Support
						</h2>
						<p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
							Empower your team with AI-driven insights, seamless collaboration,
							and unparalleled efficiency.
						</p>
						<Button size="lg" className="mr-4">
							Get Started
						</Button>
						<Button variant="outline" size="lg">
							Book a Demo
						</Button>
					</motion.div>
					<motion.div
						animate={{
							scale: [1, 1.1, 1],
							rotate: [0, 5, -5, 0]
						}}
						transition={{
							duration: 20,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "reverse"
						}}
						className="absolute inset-0 z-0"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 mix-blend-multiply" />
						{theme === "light" ? (
							<Image
								src="https://images.unsplash.com/photo-1512998844734-cd2cca565822"
								alt="Abstract gradient background - Light mode"
								className="w-full h-full object-cover"
								fill
								priority
								sizes="100vw"
							/>
						) : (
							<Image
								src="https://images.unsplash.com/photo-1567360425618-1594206637d2"
								alt="Abstract gradient background - Dark mode"
								className="w-full h-full object-cover brightness-50"
								fill
								priority
								sizes="100vw"
							/>
						)}
					</motion.div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="py-20 bg-black/5 dark:bg-black/40"
				>
					<div className="container mx-auto px-4">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold text-center mb-12 font-display"
						>
							Trusted by Industry Leaders
						</motion.h3>
						<motion.div
							variants={itemVariants}
							className="flex flex-wrap justify-center items-center gap-8"
						>
							{[
								{ icon: SiFacebook, name: "Facebook" },
								{ icon: SiSlack, name: "Slack" },
								{ icon: SiNetflix, name: "Netflix" },
								{ icon: SiAirbnb, name: "Airbnb" },
								{ icon: SiSpotify, name: "Spotify" }
							].map(({ icon: Icon, name }) => (
								<div
									key={name}
									className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
								>
									<Icon className="h-8 w-auto text-muted-foreground" />
									<span className="sr-only">{name} logo</span>
								</div>
							))}
						</motion.div>
					</div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="py-20"
				>
					<div className="container mx-auto px-4">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold text-center mb-12 font-display"
						>
							Key Features
						</motion.h3>
						<motion.div variants={itemVariants}>
							<Tabs defaultValue="support" className="w-full">
								<TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-background/60 dark:bg-background/40 backdrop-blur-sm p-1 rounded-lg">
									<TabsTrigger
										value="support"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-colors"
									>
										Support System
									</TabsTrigger>
									<TabsTrigger
										value="collaboration"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-colors"
									>
										Team Collaboration
									</TabsTrigger>
									<TabsTrigger
										value="management"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-colors"
									>
										Ticket Management
									</TabsTrigger>
									<TabsTrigger
										value="analytics"
										className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-colors"
									>
										Analytics & AI
									</TabsTrigger>
								</TabsList>
								<TabsContent value="support">
									<Card>
										<CardHeader>
											<CardTitle>Multi-Channel Support System</CardTitle>
											<CardDescription>
												Streamline your customer interactions across all
												platforms
											</CardDescription>
										</CardHeader>
										<CardContent className="grid gap-4">
											<div className="flex items-center space-x-4">
												<Mail className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Email Integration</h4>
													<p className="text-sm text-muted-foreground">
														Seamless ticket handling via Postmark
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<MessageSquare className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">
														Embedded Chat Widget
													</h4>
													<p className="text-sm text-muted-foreground">
														Direct customer communication on your website
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<Inbox className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Unified Inbox</h4>
													<p className="text-sm text-muted-foreground">
														Centralized hub for all customer interactions
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
								<TabsContent value="collaboration">
									<Card>
										<CardHeader>
											<CardTitle>Team Collaboration</CardTitle>
											<CardDescription>
												Empower your team with powerful collaboration tools
											</CardDescription>
										</CardHeader>
										<CardContent className="grid gap-4">
											<div className="flex items-center space-x-4">
												<Users className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">
														Role-Based Access Control
													</h4>
													<p className="text-sm text-muted-foreground">
														Manage team permissions with ease
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<Mail className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Shared Inboxes</h4>
													<p className="text-sm text-muted-foreground">
														Collaborate on customer inquiries efficiently
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<MessageSquare className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Internal Notes</h4>
													<p className="text-sm text-muted-foreground">
														Private threads for team discussions
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
								<TabsContent value="management">
									<Card>
										<CardHeader>
											<CardTitle>Ticket Management</CardTitle>
											<CardDescription>
												Efficiently handle and prioritize customer issues
											</CardDescription>
										</CardHeader>
										<CardContent className="grid gap-4">
											<div className="flex items-center space-x-4">
												<Tag className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">
														Customizable Statuses
													</h4>
													<p className="text-sm text-muted-foreground">
														Tailor ticket workflows to your needs
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<AlertTriangle className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Priority Levels</h4>
													<p className="text-sm text-muted-foreground">
														Ensure critical issues are addressed promptly
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<Paperclip className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">File Attachments</h4>
													<p className="text-sm text-muted-foreground">
														Secure file storage with AWS S3 integration
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
								<TabsContent value="analytics">
									<Card>
										<CardHeader>
											<CardTitle>Analytics & AI</CardTitle>
											<CardDescription>
												Gain insights and automate processes with cutting-edge
												technology
											</CardDescription>
										</CardHeader>
										<CardContent className="grid gap-4">
											<div className="flex items-center space-x-4">
												<BarChart className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Performance Metrics</h4>
													<p className="text-sm text-muted-foreground">
														Track and improve your team's efficiency
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<Zap className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">
														AI-Powered Suggestions
													</h4>
													<p className="text-sm text-muted-foreground">
														Get smart responses with OpenAI integration
													</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<PieChart className="h-6 w-6 text-primary" />
												<div>
													<h4 className="font-semibold">Data Visualization</h4>
													<p className="text-sm text-muted-foreground">
														Intuitive charts for actionable insights
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</motion.div>
					</div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="py-20 bg-black/5 dark:bg-black/40"
				>
					<div className="container mx-auto px-4">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold text-center mb-12 font-display"
						>
							Why Choose SupportHub?
						</motion.h3>
						<motion.div
							variants={itemVariants}
							className="grid gap-8 md:grid-cols-3"
						>
							<Card>
								<CardHeader>
									<Shield className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>Enterprise-Grade Security</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										Protect your data with advanced encryption, role-based
										access control, and GDPR-compliant practices.
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Zap className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>AI-Powered Efficiency</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										Leverage cutting-edge AI to automate tasks, provide smart
										suggestions, and enhance overall productivity.
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Globe className="h-8 w-8 mb-2 text-primary" />
									<CardTitle>Scalable Solution</CardTitle>
								</CardHeader>
								<CardContent>
									<p>
										Grow your support operations seamlessly with our cloud-based
										platform designed to handle enterprises of any size.
									</p>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="py-20"
				>
					<div className="container mx-auto px-4">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold text-center mb-12 font-display"
						>
							What Our Customers Say
						</motion.h3>
						<motion.div variants={itemVariants}>
							<Carousel className="w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
								<CarouselContent>
									{[
										{
											id: "testimonial-1",
											name: "Sarah Johnson",
											role: "Customer Service Manager",
											company: "TechCorp",
											testimonial:
												"SupportHub has transformed our customer service operations. The AI-powered suggestions have significantly reduced our response times."
										},
										{
											id: "testimonial-2",
											name: "Michael Chen",
											role: "CTO",
											company: "StartupX",
											testimonial:
												"The analytics provided by SupportHub have given us invaluable insights into our customer interactions. It's been a game-changer for our business."
										},
										{
											id: "testimonial-3",
											name: "Emily Rodriguez",
											role: "Support Team Lead",
											company: "E-commerce Plus",
											testimonial:
												"The collaboration features in SupportHub have greatly improved our team's efficiency. We're able to handle more tickets with less stress."
										}
									].map((item) => (
										<CarouselItem key={item.id}>
											<Card>
												<CardContent className="pt-6">
													<blockquote className="text-lg font-semibold mb-4">
														"{item.testimonial}"
													</blockquote>
													<div className="flex items-center">
														<Avatar className="h-10 w-10 mr-4">
															<AvatarImage
																src={`/placeholder.svg?height=40&width=40&text=${item.name[0]}`}
															/>
															<AvatarFallback>{item.name[0]}</AvatarFallback>
														</Avatar>
														<div>
															<p className="font-semibold">{item.name}</p>
															<p className="text-sm text-muted-foreground">
																{item.role}, {item.company}
															</p>
														</div>
													</div>
												</CardContent>
											</Card>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious />
								<CarouselNext />
							</Carousel>
						</motion.div>
					</div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="py-20 bg-black/5 dark:bg-black/40"
				>
					<div className="container mx-auto px-4">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold text-center mb-12 font-display"
						>
							Frequently Asked Questions
						</motion.h3>
						<motion.div variants={itemVariants}>
							<Accordion
								type="single"
								collapsible
								className="w-full max-w-2xl mx-auto"
							>
								<AccordionItem value="item-1">
									<AccordionTrigger className="text-lg">
										How secure is SupportHub?
									</AccordionTrigger>
									<AccordionContent className="text-base">
										SupportHub prioritizes security with Clerk authentication,
										role-based permissions, secure AWS S3 file storage, and
										GDPR-compliant data handling. We use industry-standard
										encryption and regularly undergo security audits to ensure
										your data remains protected at all times.
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="item-2">
									<AccordionTrigger className="text-lg">
										Can I customize the platform to match my brand?
									</AccordionTrigger>
									<AccordionContent className="text-base">
										SupportHub offers extensive customization options, including
										dark/light mode support, Tailwind CSS theming, and custom
										branding options for your embedded widget and
										customer-facing interfaces. You can easily adjust colors,
										logos, and layouts to align with your brand identity.
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="item-3">
									<AccordionTrigger className="text-lg">
										What kind of analytics does SupportHub provide?
									</AccordionTrigger>
									<AccordionContent className="text-base">
										SupportHub offers comprehensive analytics including
										performance metrics, customer satisfaction tracking, and
										real-time dashboard updates. Our built-in data visualization
										components make it easy to gain actionable insights from
										your support data, including response times, ticket
										resolution rates, and customer feedback trends.
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="item-4">
									<AccordionTrigger className="text-lg">
										How does the AI integration work?
									</AccordionTrigger>
									<AccordionContent className="text-base">
										SupportHub leverages OpenAI's advanced language models to
										provide smart ticket routing, suggested responses, and
										automated email handling. The AI learns from your team's
										interactions to continuously improve its suggestions,
										helping to speed up response times and maintain consistency
										in your customer communications.
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="item-5">
									<AccordionTrigger className="text-lg">
										Is SupportHub suitable for small businesses?
									</AccordionTrigger>
									<AccordionContent className="text-base">
										Yes, SupportHub is designed to scale with your business.
										Whether you're a small startup or a large enterprise, our
										flexible pricing plans and scalable infrastructure ensure
										that you only pay for what you need. As your support needs
										grow, SupportHub can easily accommodate increased ticket
										volumes and team sizes.
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</motion.div>
					</div>
				</motion.section>

				<motion.section
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="py-20"
				>
					<div className="container mx-auto px-4 text-center">
						<motion.h3
							variants={itemVariants}
							className="text-3xl font-bold mb-6 font-display"
						>
							Ready to Transform Your Customer Support?
						</motion.h3>
						<motion.p
							variants={itemVariants}
							className="text-xl mb-8 max-w-2xl mx-auto"
						>
							Join the growing list of companies providing exceptional support
							with SupportHub. Start your journey to effortless customer service
							today.
						</motion.p>
						<motion.div variants={itemVariants}>
							<Button size="lg" asChild className="mr-4">
								<a href="/sign-up">Start Your Free Trial</a>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<a href="/sign-up">
									Schedule a Demo
									<ArrowRight className="ml-2 h-4 w-4" />
								</a>
							</Button>
						</motion.div>
					</div>
				</motion.section>
			</main>

			<motion.footer
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-black/5 dark:bg-black/40 py-12"
			>
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						<div>
							<h4 className="font-semibold mb-4">Product</h4>
							<ul className="space-y-2">
								<li>Features</li>
								<li>Pricing</li>
								<li>Integrations</li>
								<li>Changelog</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Resources</h4>
							<ul className="space-y-2">
								<li>Documentation</li>
								<li>API Reference</li>
								<li>Blog</li>
								<li>Community</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Company</h4>
							<ul className="space-y-2">
								<li>About Us</li>
								<li>Careers</li>
								<li>Press</li>
								<li>Contact</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Legal</h4>
							<ul className="space-y-2">
								<li>Terms of Service</li>
								<li>Privacy Policy</li>
								<li>Cookie Policy</li>
								<li>GDPR Compliance</li>
							</ul>
						</div>
					</div>
					<Separator className="my-8" />
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-muted-foreground">
							&copy; 2024 SupportHub. All rights reserved.
						</p>
						<div className="flex space-x-4 mt-4 md:mt-0">
							<Button variant="ghost" size="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="lucide lucide-twitter"
									aria-labelledby="twitter-title"
								>
									<title id="twitter-title">Twitter</title>
									<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
								</svg>
								<span className="sr-only">Twitter</span>
							</Button>
							<Button variant="ghost" size="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="lucide lucide-linkedin"
									aria-labelledby="linkedin-title"
								>
									<title id="linkedin-title">LinkedIn</title>
									<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
									<rect width="4" height="12" x="2" y="9" />
									<circle cx="4" cy="4" r="2" />
								</svg>
								<span className="sr-only">LinkedIn</span>
							</Button>
							<Button variant="ghost" size="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="lucide lucide-github"
									aria-labelledby="github-title"
								>
									<title id="github-title">GitHub</title>
									<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
									<path d="M9 18c-4.51 2-5-2-7-2" />
								</svg>
								<span className="sr-only">GitHub</span>
							</Button>
						</div>
					</div>
				</div>
			</motion.footer>
		</div>
	)
}
