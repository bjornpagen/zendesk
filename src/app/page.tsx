"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
	ArrowRight,
	MessageSquare,
	Users,
	Mail,
	FileText,
	BarChart,
	Zap,
	Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import Link from "next/link"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
}

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 }
}

const features = [
	{
		title: "Team Collaboration",
		description:
			"Work together seamlessly with role-based access and shared inboxes",
		icon: Users
	},
	{
		title: "Multi-Channel Support",
		description: "Handle customer queries via email, widget, and more",
		icon: MessageSquare
	},
	{
		title: "Smart Routing",
		description:
			"Automatically assign tickets based on team expertise and workload",
		icon: Mail
	},
	{
		title: "File Management",
		description: "Secure file sharing and storage for customer communications",
		icon: FileText
	},
	{
		title: "Analytics",
		description: "Track performance metrics and customer satisfaction",
		icon: BarChart
	},
	{
		title: "Real-time Updates",
		description: "Stay on top of customer issues with instant notifications",
		icon: Zap
	}
]

const pricingPlans = [
	{
		name: "Starter",
		price: "$29",
		description: "Perfect for small teams just getting started",
		features: [
			"Up to 3 team members",
			"Email support",
			"Basic analytics",
			"1GB file storage",
			"Widget integration"
		]
	},
	{
		name: "Professional",
		price: "$99",
		description: "For growing teams that need more power",
		features: [
			"Up to 10 team members",
			"Priority routing",
			"Advanced analytics",
			"10GB file storage",
			"Custom branding",
			"API access"
		]
	},
	{
		name: "Enterprise",
		price: "Custom",
		description: "For large organizations with custom needs",
		features: [
			"Unlimited team members",
			"24/7 priority support",
			"Custom integrations",
			"Unlimited storage",
			"SLA guarantees",
			"Dedicated account manager"
		]
	}
]

export default function LandingPage() {
	const [showDemo, setShowDemo] = useState(false)

	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
			{/* Hero Section */}
			<motion.section
				className="min-h-screen container mx-auto px-4 py-24 text-center flex flex-col justify-center relative overflow-hidden"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Gradient Orbs */}
				<div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
				<div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
				<div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

				<motion.h1
					className="text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-transparent bg-clip-text relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					Customer Support, Simplified
				</motion.h1>

				<motion.p
					className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					Streamline your customer support with our powerful platform. Handle
					tickets, collaborate with your team, and delight your customers.
				</motion.p>
				<motion.div
					className="flex justify-center gap-4 relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<Button
						size="lg"
						className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
						asChild
					>
						<Link href="/messages?status=open&needsResponse=true">
							Get Started <ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						size="lg"
						variant="outline"
						onClick={() => setShowDemo(true)}
						className="border-2 border-purple-500/50 hover:border-purple-400 bg-black/50 backdrop-blur-sm text-white"
					>
						View Demo
					</Button>
				</motion.div>
			</motion.section>

			<Dialog open={showDemo} onOpenChange={setShowDemo}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Product Demo</DialogTitle>
					</DialogHeader>
					<div className="aspect-video">
						<iframe
							title="Product Demo Video"
							src="https://www.loom.com/embed/c66081e358324353bddf266f0afaf88a?sid=8fa9f964-09e6-4cbf-a8d2-1c5f49927dd8"
							allowFullScreen
							className="w-full h-full"
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Features Section */}
			<section className="min-h-screen py-24 flex items-center relative bg-gradient-to-b from-purple-950 via-black to-purple-950">
				<div className="container mx-auto px-4">
					<motion.div
						variants={container}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
					>
						{features.map((feature) => (
							<motion.div key={feature.title} variants={item}>
								<Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-colors">
									<CardHeader>
										<feature.icon className="h-8 w-8 mb-4 text-purple-400" />
										<CardTitle className="text-gray-200">
											{feature.title}
										</CardTitle>
										<CardDescription className="text-gray-400">
											{feature.description}
										</CardDescription>
									</CardHeader>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="min-h-screen py-24 flex items-center bg-gradient-to-b from-black via-purple-950 to-black relative">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-transparent bg-clip-text">
							Simple, Transparent Pricing
						</h2>
						<p className="text-gray-300">
							Choose the plan that's right for your team
						</p>
					</motion.div>

					<motion.div
						variants={container}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-3 gap-8"
					>
						{pricingPlans.map((plan) => (
							<motion.div key={plan.name} variants={item}>
								<Card className="bg-black/50 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-colors">
									<CardHeader>
										<CardTitle className="text-2xl text-gray-200">
											{plan.name}
										</CardTitle>
										<CardDescription className="text-gray-400">
											{plan.description}
										</CardDescription>
										<p className="text-4xl font-bold mt-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
											{plan.price}
										</p>
										<p className="text-sm text-gray-400">per month</p>
									</CardHeader>
									<CardContent>
										<ul className="space-y-2">
											{plan.features.map((feature) => (
												<li
													key={feature}
													className="flex items-center gap-2 text-gray-300"
												>
													<Shield className="h-4 w-4 text-purple-400" />
													<span className="text-sm">{feature}</span>
												</li>
											))}
										</ul>
										<Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0">
											Get Started with {plan.name}
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="min-h-screen bg-primary text-primary-foreground py-24 flex items-center">
				<div className="container mx-auto px-4">
					<motion.div
						variants={container}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
					>
						<motion.div variants={item}>
							<h3 className="text-4xl font-bold mb-2">99.9%</h3>
							<p>Uptime guarantee</p>
						</motion.div>
						<motion.div variants={item}>
							<h3 className="text-4xl font-bold mb-2">24/7</h3>
							<p>Customer support</p>
						</motion.div>
						<motion.div variants={item}>
							<h3 className="text-4xl font-bold mb-2">1M+</h3>
							<p>Tickets processed</p>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="min-h-screen py-24 flex items-center">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
						<p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join thousands of teams who are already using our platform to
							provide better customer support.
						</p>
						<div className="flex justify-center gap-4">
							<Button size="lg" className="gap-2" asChild>
								<Link href="/messages">
									Start Free Trial <ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button size="lg" variant="outline">
								Contact Sales
							</Button>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-muted/50 py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="font-bold mb-4">Product</h3>
							<ul className="space-y-2">
								<li>Features</li>
								<li>Pricing</li>
								<li>Security</li>
								<li>Roadmap</li>
							</ul>
						</div>
						<div>
							<h3 className="font-bold mb-4">Company</h3>
							<ul className="space-y-2">
								<li>About</li>
								<li>Blog</li>
								<li>Careers</li>
								<li>Contact</li>
							</ul>
						</div>
						<div>
							<h3 className="font-bold mb-4">Resources</h3>
							<ul className="space-y-2">
								<li>Documentation</li>
								<li>API Reference</li>
								<li>Status</li>
								<li>Terms of Service</li>
							</ul>
						</div>
						<div>
							<h3 className="font-bold mb-4">Connect</h3>
							<ul className="space-y-2">
								<li>Twitter</li>
								<li>GitHub</li>
								<li>Discord</li>
								<li>Email</li>
							</ul>
						</div>
					</div>
					<div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
						© 2024 Your Company. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	)
}
