# Jazztips Astro

## Read
+ [](https://github.com/withastro/astro/tree/latest/examples/blog)

# Inspiration

Blog, search, good example on using Typescript
+ [](https://github.com/satnaing/astro-paper)

Blog post
+ [](https://www.stevefenton.co.uk/blog/2022/10/astro-paging-and-listing-by-category/#the-getstaticpaths-function)


## Add a new record

```shell
npm run new
```

Type as argument `{artist} - {albumname}`. For example: "miles davis - kind of blue"

## Generate a nice OG Image

```shell
docker run -it --env-file .env -v $(pwd):/opt/node/js -v $(pwd)/src:/opt/node/src my-node-app:latest ./tools/og-image/og-image.js sonny-rollins-and-the-contemporary-leaders.md
```

Replace sonny-rollins-and-the-contemporary-leaders.md with the file you want to create an OG image for

## Todo

+ [ ] Add RSS feed
+ [ ] Better search

## Save for later

```js
<time datetime={post.frontmatter.pubDate}>
	{new Date(post.frontmatter.pubDate).toLocaleDateString(
		"en-us",
		{
			year: "numeric",
			month: "short",
			day: "numeric",
		}
	)}
</time>
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
