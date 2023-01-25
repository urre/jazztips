I have a folder of markdown files in the path "." , I'd like to have a script that walk the folder and do the following using Node.js.

1. Replace the frontmatter variable tags that looks like this tags: brooks  hubbard to tags: ["brooks", "hubbard"].
2. Replace the existing frontmatter layout: post with layout: "../../layouts/Record.astro"
3. Replace the filename structure from 2010-12-25-letter-to-herbie.md to just letter-to-herbie.md
4. Re structyre the credits front matter to be in this format:

credits:
- { name: 'Calle Rasmusson', instrument: 'Drums' }
- { name: 'Svante Söderqvist', instrument: 'Kontrabas' }

5. In addition to replacing the filename structure, extract the date from the filename and as a frontmatter variable
6. add the new frontmatter date below layout frontmatter


credits:
- { name: 'Brian Blade', instrument: 'Drums' }
- { name: 'John Patitucci', instrument: 'Bass' }
- { name: 'Joel Weiskopf', instrument: 'Piano' }
