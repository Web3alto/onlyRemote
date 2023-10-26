import { prisma } from "@/lib/prisma";
import JobList from "../components/JobList"; // Import our new client component

type Job = {
	id: string;
	date: Date;
	title: string;
	company: string;
	salary: string | null;
	url: string;
	logo: string | null;
};

export default async function Home() {
	const jobs: Job[] = await prisma.jobs.findMany({
		where: {
			date: {
				// today minus 1 day
				gte: new Date(new Date().setDate(new Date().getDate() - 1)),
			},
			NOT: {
				salary: null,
			},
		},
	});

	return <JobList jobs={jobs} />;
}
