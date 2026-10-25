import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

// One small cover shared by the archive, musician and search lists (shown at
// 48-80 css px, so 160 px covers retina screens)
export async function coverThumb(image: ImageMetadata): Promise<string> {
  return (await getImage({ src: image, width: 160, format: "webp" })).src;
}
