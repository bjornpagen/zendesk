import Link from "next/link"

export default function HomePage() {
	return (
		<main>
			<h1 className="text-2xl font-bold font-display">Hello World</h1>
			<Link href="https://example.com">Example</Link>
		</main>
	)
}
