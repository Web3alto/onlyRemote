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
	const [filterText, setFilterText] = useState("");

	const extractSalaryValue = (salaryString: string | null): number => {
		if (!salaryString) return 0;

		const rangeMatches = salaryString.match(
			/\$[\d\.]+k\s*-\s*\$([\d\.]+)k/
		);
		if (rangeMatches && rangeMatches[1]) {
			const upperValue = parseFloat(rangeMatches[1]);
			return upperValue * 1000;
		}

		const singleValueMatches = salaryString.match(
			/\$([\d\.]+)k|(\$[\d,]+)/
		);
		if (singleValueMatches) {
			if (singleValueMatches[1]) {
				return parseFloat(singleValueMatches[1]) * 1000;
			} else if (singleValueMatches[2]) {
				const valueWithoutComma = singleValueMatches[2]
					.replace(/,/g, "")
					.slice(1);
				return parseFloat(valueWithoutComma);
			}
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

		setSortedJobs(newSortedJobs);
	}, [filter, jobs]);

	const filteredJobs = sortedJobs.filter((job) =>
		job.title.toLowerCase().includes(filterText.toLowerCase())
	);

	return (
		<div
			key={filter}
			className="flex flex-col items-center justify-start w-[full] m-auto bg-[#16161A] min-h-screen"
		>
			<div className="flex flex-col w-[90vw] lg:w-[50vw] p-[3vw]">
				<h1 className="font-semibold text-[7.5vw] sm:text-[5vw] lg:text-[2.5vw] text-[#FFFFFE] my-[5vh]">
					{filteredJobs.length} jobs Available
				</h1>
				<div className="flex flex-col sm:flex-row items-start sm:items-end justify-between">
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
						className=" pl-[1vw] w-[10vw] py-[.75vw] border-none bg-[#30353D] rounded-[.5vw] text-left text-[#94A1B2] text-[3.75vw] sm:text-[2vw] lg:text-[.9vw] mb-[3vw] sm:mb-0"
					>
						<option value="all">All Salaries</option>
						<option value="highest">Highest Salary</option>
						<option value="lowest">Lowest Salary</option>
					</select>

					<input
						className="text-[3.75vw] sm:text-[2vw] lg:text-[.9vw] border-none bg-[#30353D] rounded-[.5vw] px-[2vw] py-[.75vw] text-[#FFFFFE] ring-0"
						type="text"
						placeholder="Filter by keyword..."
						value={filterText}
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setFilterText(e.target.value);
						}}
					/>
				</div>

				<ul className="flex items-center justify-center flex-col mt-[2.5vh] pt-[5vh] border-t-2 border-[#94A1B2]">
					{filteredJobs.length === 0 ? (
						<div className="text-[#FFFFFE] mb-[3vh]">
							No results for &quot;{filterText}&quot;
						</div>
					) : (
						filteredJobs.map((job) => (
							<li
								className="w-full mb-[3vh] bg-[#30353D] rounded-[1.25vw] drop-shadow-[0_10px_8px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-[1.025] transition duration-500 ease"
								key={job.id}
							>
								<Link href={job.url}>
									<Card className="hover:bg-muted/50 border-none relative">
										<CardHeader className="flex flex-row p-[3vw] lg:p-[1.5vw]">
											<div className="w-[9vw] sm:w-[6vw] lg:w-[3vw] flex items-center justify-center mr-[2vw] lg:mr-[1vw]">
												<Avatar className="h-[9vw] sm:h-[6vw] lg:h-[3vw] w-[9vw] sm:w-[6vw] lg:w-[3vw]">
													<AvatarFallback className="bg-[#16161A] text-[#FFFFFE] text-[1.25vw]">
														{job.company[0]}
													</AvatarFallback>
													{job.logo ? (
														<AvatarImage
															src={job.logo}
															alt={job.company}
															className="object-contain"
														/>
													) : null}
												</Avatar>
											</div>
											<div className="flex flex-col items-start justify-center gap-[.8vw] sm:gap-[.4vw]">
												<CardTitle className="text-[#FFFFFE] text-[5vw] sm:text-[2.5vw] lg:text-[1.2vw] leading-[3.5vh] sm:leading-[2.75vh]">
													{job.title}
												</CardTitle>
												<CardDescription className="sm:relative text-[#94A1B2] text-[3.75vw] sm:text-[2vw] lg:text-[.9vw]">
													{job.company} - {job.salary}
												</CardDescription>
											</div>
										</CardHeader>
									</Card>
								</Link>
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
};

export default JobList;
