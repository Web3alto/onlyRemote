import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "OnlyRemote",
	description: `Your Ultimate Destination for Remote Job Listings! Dive into a curated pool of opportunities gathered from across the web, all in one place. Whether you're seeking a new career or just browsing, our advanced web scraping technology ensures you don't miss out on the perfect remote job. Start your search with us and make remote work a reality.`,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
