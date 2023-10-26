"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type Job = {
	id: string;
	date: Date;
	title: string;
	company: string;
	salary: string | null;
	url: string;
	logo: string | null;
};

const JobList: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
	const [filter, setFilter] = useState<"all" | "highest" | "lowest">("all");
	const [sortedJobs, setSortedJobs] = useState<Job[]>(jobs);
	const [filterText, setFilterText] = useState(""); // Add state for filter text

	const extractSalaryValue = (salaryString: string | null): number => {
		if (!salaryString) return 0;

		const matches = salaryString.match(/\$[\d\.]+k\s*-\s*\$([\d\.]+)k/);

		if (matches && matches[1]) {
			const upperValue = parseFloat(matches[1]);
			return upperValue * 1000;
		}

		return 0;
	};

	useEffect(() => {
		let newSortedJobs = [...jobs];

		if (filter === "highest") {
			newSortedJobs = newSortedJobs.filter((job) => job.salary);
			newSortedJobs.sort(
				(a, b) =>
					extractSalaryValue(b.salary) - extractSalaryValue(a.salary)
			);
		} else if (filter === "lowest") {
			newSortedJobs = newSortedJobs.filter((job) => job.salary);
			newSortedJobs.sort(
				(a, b) =>
					extractSalaryValue(a.salary) - extractSalaryValue(b.salary)
			);
		}

		console.log("Sorted jobs:", newSortedJobs);
		setSortedJobs(newSortedJobs);
	}, [filter, jobs]);

	// Filter the jobs based on the filterText
	const filteredJobs = sortedJobs.filter((job) =>
		job.title.toLowerCase().includes(filterText.toLowerCase())
	);

	return (
		<div
			key={filter}
			className="flex flex-col items-center justify-center w-[full] m-auto bg-[#16161A]"
		>
			<div className="flex flex-col w-[50vw] p-[3vw]">
				<h1 className="font-semibold text-[2.5vw] text-[#FFFFFE] mb-[5vh]">
					5 jobs Available
				</h1>

				<div className="mb-4">
					<label
						htmlFor="salaryFilter"
						className="block mb-2 text-white"
					>
						Filter by Salary:
					</label>
					<select
						id="salaryFilter"
						value={filter}
						onChange={(e: ChangeEvent<HTMLSelectElement>) => {
							const newFilter = e.target.value as
								| "all"
								| "highest"
								| "lowest";
							console.log("Filter changed to:", newFilter);
							setFilter(newFilter);
						}}
						className="p-2"
					>
						<option value="all">All</option>
						<option value="highest">Highest</option>
						<option value="lowest">Lowest</option>
					</select>
				</div>

				{/* Add the text input field for filtering */}
				<input
					type="text"
					placeholder="Filter by keyword..."
					value={filterText}
					onChange={(e: ChangeEvent<HTMLInputElement>) => {
						setFilterText(e.target.value);
					}}
				/>

				<ul className="flex items-center justify-center flex-col">
					{filteredJobs.map((job) => (
						<li
							className="w-full mb-[3vh] bg-[#30353D] rounded-[1.25vw] drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)]"
							key={job.id}
						>
							<Link href={job.url}>
								<Card className="hover:bg-muted/50 border-none">
									<CardHeader className="flex flex-row gap-4">
										<div className="w-[3vw] flex items-center justify-center">
											<Avatar className="h-[6vh] w-[3vw]">
												<AvatarFallback className="bg-[#16161A] text-[#FFFFFE] text-[1.25vw]">
													{job.company[0]}
												</AvatarFallback>
												{job.logo ? (
													<AvatarImage
														src={job.logo}
														alt={job.company}
													/>
												) : null}
											</Avatar>
										</div>
										<div className="flex flex-col gap-2">
											<CardTitle className="text-[#FFFFFE]">
												{job.title}
											</CardTitle>
											<CardDescription className="text-[#94A1B2]">
												{job.company} - {job.salary}
											</CardDescription>
										</div>
									</CardHeader>
								</Card>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default JobList;
