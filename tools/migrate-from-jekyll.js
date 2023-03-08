const fs = require("fs");
const matter = require("gray-matter");
const path = require("path");

// Walk the folder
fs.readdir("../src/pages/", (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    // Only process markdown files
    if (path.extname(file) === ".md") {
      fs.readFile(`../src/pages/${file}`, "utf-8", (err, data) => {
        if (err) throw err;

        // Parse frontmatter
        let { data: frontmatter, content } = matter(data);

        // Skip the about page
        if (file.includes("about") || file.includes("search")) {
          return false;
        }

        // Replace the frontmatter variable tags
        if (frontmatter.tags) {
          if (typeof frontmatter.tags === "string") {
            frontmatter.tags = frontmatter.tags.split(" ");
          } else {
            frontmatter.tags = frontmatter.tags;
          }
        }

        // Replace the existing frontmatter layout
        frontmatter.layout = "../layouts/Record.astro";

        // Extract the date from the filename and add it as a frontmatter variable
        const regex = /^(\d{4}-\d{2}-\d{2})/;
        const pubDate =
          file.match(regex)?.[1] ?? "No date found in the filename";
        frontmatter.pubDate = pubDate;

        // Re structure the credits front matter

        if (frontmatter.credits) {
          if (frontmatter.credits.musicians) {
            if (frontmatter.credits.musicians.musician) {
              frontmatter.credits = frontmatter.credits.musicians.musician;
            } else {
              frontmatter.credits = frontmatter.credits.musicians;
            }
          }

          //flattening the credits structure
          let newCredits = [];

          if (frontmatter.credits) {
            frontmatter.credits.forEach((c) => {
              newCredits.push({ name: c.name, instrument: c.instrument });
            });
          }
          frontmatter.credits = newCredits;
        }

        // Replace the filename structure
        const newFileName = file.replace(/^\d{4}-\d{2}-\d{2}-/, "");

        // Write the new file
        fs.writeFile(
          `../src/pages/${newFileName}`,
          matter.stringify(content, frontmatter),
          (err) => {
            if (err) throw err;
            console.log(`${file} was renamed to ${newFileName} and updated.`);
          }
        );
      });
    }
  });
});
