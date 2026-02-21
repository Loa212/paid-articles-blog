import { Hono } from "hono";
import { getArticle, getArticlePreview, listArticles } from "./articles.ts";

const app = new Hono();

// Homepage: list all articles (free)
app.get("/", (c) => {
	const articles = listArticles();
	return c.json({ articles });
});

// Preview: first ~200 words + metadata (free)
app.get("/articles/:slug/preview", (c) => {
	const { slug } = c.req.param();
	const preview = getArticlePreview(slug);

	if (!preview) {
		return c.json({ error: "Article not found" }, 404);
	}

	return c.json(preview);
});

// Full article: complete content (paid via Tollbooth)
app.get("/articles/:slug", (c) => {
	const { slug } = c.req.param();
	const article = getArticle(slug);

	if (!article) {
		return c.json({ error: "Article not found" }, 404);
	}

	return c.json(article);
});

const port = Number.parseInt(process.env.PORT || "4000", 10);

console.log(`Blog server running on http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
