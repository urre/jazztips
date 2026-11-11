import { getCollection } from "astro:content";
import { coverThumb } from "@utils/cloudinary";

// The header search loads this the first time someone uses it, instead of
// every page embedding the whole list
export async function GET() {
  const records = await getCollection("records", ({ data }) => import.meta.env.DEV || !data.draft);

  const searchList = records.map(({ id, data }) => ({
    id,
    data: {
      title: data.title,
      artist: data.artist,
      label: data.label,
      credits: data.credits,
      image: coverThumb(data.image),
    },
  }));

  return new Response(JSON.stringify(searchList), {
    headers: { "Content-Type": "application/json" },
  });
}
