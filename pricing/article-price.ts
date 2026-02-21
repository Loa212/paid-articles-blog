// Tollbooth pricing function
// Called at request time to resolve per-article prices from the blog backend.
// Each author sets their own price in the article's frontmatter.

const BLOG_URL = process.env.BLOG_URL ?? "http://localhost:4000";

export default async function ({ params }: { params: Record<string, string> }) {
	const slug = params["*"];
	const res = await fetch(`${BLOG_URL}/articles/${slug}/meta`);

	if (!res.ok) {
		return "$0.01"; // fallback price
	}

	const { price } = (await res.json()) as { price: string };
	return price;
}
