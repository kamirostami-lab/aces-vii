const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const schema = require("@quasibit/eleventy-plugin-schema");
const Image = require("@11ty/eleventy-img");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy({ "src/assets/repository/documents": "documents" });

  eleventyConfig.addPlugin(feedPlugin, {
    collection: "news",
    metadata: {
      title: "Ace Strategies | Market Intelligence",
      subtitle: "Polling data, strategic analysis, and announcements.",
      language: "en-AU",
      url: "https://acestrategies.au",
      author: { name: "Ace Strategies", email: "info@acestrategies.au" }
    }
  });

  eleventyConfig.addPlugin(sitemap, {
    sitemap: { hostname: "https://acestrategies.au" },
    lastModifiedProperty: "date",
  });

  eleventyConfig.addPlugin(schema);

  const md = markdownIt({ html: true, breaks: true, linkify: true })
    .use(markdownItAnchor);
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addCollection("news", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/news/*.md").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("cases", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/cases/*.md").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addShortcode("image", async function(src, alt, sizes = "100vw") {
    if (!src) return '';
    let metadata = await Image(src, {
      widths: [300, 600, 900],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/img/optimised/",
      urlPath: "/img/optimised/"
    });
    return Image.generateHTML(metadata, { alt, sizes, loading: "lazy", decoding: "async" });
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addFilter("dateFormat", (date, format = "long") => {
    if (!date) return '';
    const d = new Date(date);
    return format === "iso" ? d.toISOString().split('T')[0] : d.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  });
  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      const htmlmin = require("html-minifier-terser");
      return htmlmin.minify(content, { collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true });
    }
    return content;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data", layouts: "_includes/layouts" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
