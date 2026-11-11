import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const records = defineCollection({

	loader: glob({ base: './src/content/', pattern: '**/*.{md,mdx}' }),

	schema: z.object({
		draft: z.boolean().default(false),
		title: z.string(),
    artist: z.string(),
		pubDate: z.coerce.date(),
    label: z.string().optional(),
    year: z.number().optional(),
    tags: z.array(z.string()),
    // Covers live on Cloudinary, see scripts/cloudinary-covers.mjs
    image: z.string().url().startsWith("https://res.cloudinary.com/urre/"),
    // Where the cover was downloaded from
    imageSource: z.string().url().optional(),
    ogimage: z.string().url().optional(),
    spotify: z.string().url().optional(),
    tidal: z.union([z.string(), z.number()]).optional(),
    apple: z.string().url().optional(),
    qobuz: z.string().url().optional(),
    credits: z.array(z.object({
      name: z.string(),
      instrument: z.string()
    }))
	}),
});



export const collections = { records };
