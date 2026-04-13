module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("limit", function(arr, limit) {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter("dateFormat", function(date, format) {
    if (!date) return "";
    var d = new Date(date);
    if (format === "iso") return d.toISOString().split("T")[0];
    return d.toLocaleDateString("en-AU", { 
      year: "numeric", month: "long", day: "numeric" 
    });
  });

  eleventyConfig.addCollection("news", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/news/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("cases", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/cases/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("newsletters", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/newsletters/*.md")
      .sort((a, b) => b.date - a.date);
  });

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
    markdownTemplateEngine: "njk"
  };
};
