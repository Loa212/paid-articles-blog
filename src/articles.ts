import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export interface Article {
	slug: string;
	title: string;
	date: string;
	price: string;
	excerpt: string;
	content: string;
}

export interface ArticlePreview {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	preview: string;
	wordCount: number;
}

const CONTENT_DIR = join(import.meta.dir, "..", "content");
const PREVIEW_WORDS = 200;

function loadArticles(): Map<string, Article> {
	const articles = new Map<string, Article>();
	const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

	for (const file of files) {
		const slug = file.replace(/\.md$/, "");
		const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
		const { data, content } = matter(raw);

		articles.set(slug, {
			slug,
			title: data.title as string,
			date: data.date as string,
			price: (data.price as string) ?? "$0.01",
			excerpt: data.excerpt as string,
			content: content.trim(),
		});
	}

	return articles;
}

const articles = loadArticles();

export function listArticles(): Array<{
	slug: string;
	title: string;
	date: string;
	price: string;
	excerpt: string;
}> {
	return [...articles.values()]
		.sort((a, b) => b.date.localeCompare(a.date))
		.map(({ slug, title, date, price, excerpt }) => ({
			slug,
			title,
			date,
			price,
			excerpt,
		}));
}

export function getArticlePreview(slug: string): ArticlePreview | null {
	const article = articles.get(slug);
	if (!article) return null;

	const words = article.content.split(/\s+/);
	const preview =
		words.length > PREVIEW_WORDS
			? `${words.slice(0, PREVIEW_WORDS).join(" ")}...`
			: article.content;

	return {
		slug: article.slug,
		title: article.title,
		date: article.date,
		excerpt: article.excerpt,
		preview,
		wordCount: words.length,
	};
}

export function getArticleMeta(
	slug: string,
): { slug: string; title: string; date: string; price: string } | null {
	const article = articles.get(slug);
	if (!article) return null;
	return {
		slug: article.slug,
		title: article.title,
		date: article.date,
		price: article.price,
	};
}

export function getArticle(slug: string): Article | null {
	return articles.get(slug) ?? null;
}
