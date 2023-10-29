import { Prisma } from "@prisma/client";
import axios from "axios";
import { parse } from "node-html-parser";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: Request, res: Response) => {
	const remoteOKJobs = await getRemoteOkJobs();
	const workRemotelyJobs = await getWorkRemotelyJobs();
	const glassdoorJobs = await getGlassdoorJobs();

	const jobs = [...workRemotelyJobs, ...remoteOKJobs, ...glassdoorJobs];

	await prisma.jobs.createMany({
		data: jobs,
		skipDuplicates: true,
	});

	return NextResponse.json({
		jobs,
	});
};

const customHeaders = {
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
	"Cache-Control": "max-age=0",
	"Sec-Ch-Ua":
		'"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
	"Sec-Ch-Ua-Mobile": "?0",
	"Sec-Ch-Ua-Platform": '"Windows"',
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "none",
	"Sec-Fetch-User": "?1",
	"Upgrade-Insecure-Requests": "1",
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
};

const getWorkRemotelyJobs = async () => {
	const response = await axios.get(
		"https://weworkremotely.com/categories/remote-full-stack-programming-jobs#job-listings",
		{
			headers: customHeaders,
			maxRedirects: 30,
		}
	);
	const root = parse(response.data);

	const jobs = root.querySelectorAll("article li").map((row) => {
		if (row.classList.contains("ad")) return;

		const obj = {
			title: "",
			company: "",
			date: new Date(),
			logo: "",
			salary: "",
			url: "",
		} as Prisma.JobsCreateManyInput;

		const title = row.querySelector(".title");
		if (title) {
			obj.title = title.textContent?.trim() ?? "";
		}

		const company = row.querySelector(".company");
		if (company) {
			obj.company = company.textContent?.trim() ?? "";
		}

		const divLogo = row.querySelector(".flag-logo");
		if (divLogo) {
			const backgroundImage = divLogo.getAttribute("style");
			const imgUrlMatch = backgroundImage?.match(
				/url\(["']?([^"']*)["']?\)/
			);
			if (imgUrlMatch) {
				obj.logo = imgUrlMatch[1];
			}
		}

		const aElement = row.querySelectorAll("a")[1];
		if (aElement) {
			obj.url =
				"https://weworkremotely.com/" + aElement.getAttribute("href") ??
				"";
		}

		return obj;
	});

	const jobsFiltered = jobs.filter((job) => {
		if (!job) return false;
		if (!job?.title) return false;
		if (!job?.url) return false;
		if (!job?.company) return false;
		return true;
	}) as Prisma.JobsCreateManyInput[];

	return jobsFiltered;
};

const getGlassdoorJobs = async () => {
	const baseUrl = "https://remote.co/remote-jobs/developer/";
	const response = await axios.get(baseUrl);
	const root = parse(response.data);

	const jobDivs = root.querySelectorAll(
		".card.m-0.border-left-0.border-right-0.border-top-0.border-bottom"
	);

	const extractSalary = async (url: string): Promise<string> => {
		try {
			const salaryResponse = await axios.get(url);
			const salaryRoot = parse(salaryResponse.data);
			const salaryDiv = salaryRoot.querySelector(
				".job_info_container_sm .salary_sm.row .col-10.col-sm-11.pl-1"
			);
			const salaryMatches = salaryDiv?.text.match(/\$([\d,]+)/);

			return salaryMatches ? salaryMatches[0] : "";
		} catch (error) {
			console.error(
				`Error while fetching salary data from ${url}:`,
				error
			);
			return "";
		}
	};

	const jobs = await Promise.all(
		jobDivs.map(async (jobDiv) => {
			const obj = {
				title: "",
				company: "",
				date: new Date(),
				logo: "",
				salary: "",
				url: "",
			} as Prisma.JobsCreateManyInput;

			obj.title =
				jobDiv.querySelector("span.font-weight-bold.larger")?.text ??
				"";
			const companyText =
				jobDiv.querySelector("p.m-0.text-secondary")?.text ?? "";
			obj.company = companyText.split("|")[0].trim();
			obj.logo =
				jobDiv
					.querySelector("img.card-img")
					?.getAttribute("data-lazy-src") ?? "";
			const href = jobDiv?.rawAttributes.href || "";
			const defUrl = "https://remote.co/";
			obj.url = defUrl + href;
			const extractedSalary = await extractSalary(obj.url);
			if (extractedSalary) {
				obj.salary = "💰 " + extractedSalary;
			}

			return obj;
		})
	);

	const jobsFiltered = jobs.filter((job) => {
		if (!job.title) return false;
		if (!job.url) return false;
		if (!job.company) return false;
		return true;
	}) as Prisma.JobsCreateManyInput[];

	return jobsFiltered;
};

const getRemoteOkJobs = async () => {
	const response = await axios.get(
		"https://remoteok.com/remote-engineer-jobs?order_by=date",
		{
			headers: customHeaders,
			maxRedirects: 30,
		}
	);
	const root = parse(response.data);

	const jobs = root.querySelectorAll("tr").map((row) => {
		if (row.classList.contains("ad")) return;

		const obj = {
			title: "",
			company: "",
			date: new Date(),
			logo: "",
			salary: "",
			url: "",
		} as Prisma.JobsCreateManyInput;

		const h2Title = row.querySelector("h2");
		if (h2Title) {
			obj.title = h2Title.textContent?.trim() ?? "";
		}

		const h3Company = row.querySelector("h3");
		if (h3Company) {
			obj.company = h3Company.textContent?.trim() ?? "";
		}

		const hasLogoElement = row.querySelector(".has-logo");
		if (hasLogoElement) {
			const img = hasLogoElement.querySelector("img");
			obj.logo = img?.getAttribute("data-src") ?? "";
		}

		const url = row.getAttribute("data-url");
		if (url) {
			obj.url = "https://remoteok.com" + url;
		}

		const locationsElements = row.querySelectorAll(".location");
		for (const locationElement of locationsElements) {
			const location = locationElement.textContent?.trim() ?? "";
			if (location.startsWith("💰")) {
				obj.salary = location;
			}
		}

		return obj;
	});

	const jobsFiltered = jobs.filter((job) => {
		if (!job) return false;
		if (!job?.title) return false;
		if (!job?.url) return false;
		if (!job?.company) return false;
		return true;
	}) as Prisma.JobsCreateManyInput[];

	return jobsFiltered;
};
