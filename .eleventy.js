module.exports = function(eleventyConfig) {

  // =========================================================================
  // PASSTHROUGH COPY — Static assets copied directly to _site/
  // =========================================================================

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "/robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "/favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "/favicon.svg" });

  // =========================================================================
  // WATCH TARGETS — Additional files to watch for changes
  // =========================================================================

  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");
  eleventyConfig.addWatchTarget("src/_data/");

  // =========================================================================
  // SHORTCODES — Reusable template snippets
  // =========================================================================

  // Current year (e.g., © 2026)
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Current date formatted
  eleventyConfig.addShortcode("currentDate", (format = "long") => {
    const date = new Date();
    if (format === "iso") return date.toISOString().split("T")[0];
    if (format === "year") return date.getFullYear().toString();
    return date.toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  // =========================================================================
  // FILTERS — Transform data in templates
  // =========================================================================

  // Limit array to specified number of items
  eleventyConfig.addFilter("limit", function(arr, limit) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, limit);
  });

  // Skip first n items
  eleventyConfig.addFilter("skip", function(arr, count) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(count);
  });

  // Format dates
  eleventyConfig.addFilter("dateFormat", function(date, format) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    if (format === "iso") return d.toISOString().split("T")[0];
    if (format === "year") return d.getFullYear().toString();
    if (format === "short") {
      return d.toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
    return d.toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  // Convert string to slug (URL-friendly)
  eleventyConfig.addFilter("slug", function(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
  });

  // Truncate text to specified length
  eleventyConfig.addFilter("truncate", function(str, length = 100, suffix = "...") {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  });

  // Convert newlines to <br> tags
  eleventyConfig.addFilter("nl2br", function(str) {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  });

  // Get first paragraph from markdown content
  eleventyConfig.addFilter("firstParagraph", function(content) {
    if (!content) return "";
    const match = content.match(/<p>(.*?)<\/p>/);
    return match ? match[1] : "";
  });

  // JSON stringify for debugging
  eleventyConfig.addFilter("dump", function(obj) {
    return JSON.stringify(obj, null, 2);
  });

  // Console log for debugging (use with caution)
  eleventyConfig.addFilter("log", function(value) {
    console.log(value);
    return value;
  });

  // Get reading time for content
  eleventyConfig.addFilter("readingTime", function(content) {
    if (!content) return "1 min read";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  });

  // Sort array by property
  eleventyConfig.addFilter("sortBy", function(arr, prop, order = "asc") {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      if (order === "desc") {
        return b[prop] > a[prop] ? 1 : -1;
      }
      return a[prop] > b[prop] ? 1 : -1;
    });
  });

  // Filter array by property value
  eleventyConfig.addFilter("where", function(arr, prop, value) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => item[prop] === value);
  });

  // Get unique values from array of objects by property
  eleventyConfig.addFilter("unique", function(arr, prop) {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    return arr.filter(item => {
      const val = item[prop];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  });

  // =========================================================================
  // COLLECTIONS — Custom content collections
  // =========================================================================

  eleventyConfig.addCollection("news", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/news/*.md")
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("cases", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/cases/*.md");
  });

  eleventyConfig.addCollection("newsletters", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/newsletters/*.md")
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("teamMembers", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/team/*.md")
        .sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
  });

  eleventyConfig.addCollection("featuredNews", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/news/*.md")
        .filter(item => item.data.featured === true)
        .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("services", function(collectionApi) {
    return collectionApi
        .getFilteredByGlob("src/content/services/*.md")
        .sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
  });

  // =========================================================================
  // TRANSFORMS — Modify output HTML
  // =========================================================================

  // Minify HTML in production
  if (process.env.NODE_ENV === "production") {
    const htmlmin = require("html-minifier-terser");
    eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
      if (outputPath && outputPath.endsWith(".html")) {
        return htmlmin.minify(content, {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          includeAutoGeneratedTags: false,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          sortAttributes: true,
          sortClassName: true,
          useShortDoctype: true
        });
      }
      return content;
    });
  }

  // =========================================================================
  // RETURN CONFIGURATION
  // =========================================================================

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
      layouts: "_includes/layouts"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",

    // Additional options
    pathPrefix: "/",
    passthroughFileCopy: true
  };
};