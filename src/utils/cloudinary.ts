// Covers and site images live on Cloudinary (see scripts/cloudinary-covers.mjs).
// Resizing and format conversion happen in the URL, so Vercel serves no images.

const UPLOAD = "/image/upload/";

// f_auto picks AVIF/WebP per browser, q_auto the quality; covers are cropped
// square like they are displayed
export function cloudinary(url: string, transformation: string): string {
  return url.includes(UPLOAD) ? url.replace(UPLOAD, `${UPLOAD}${transformation}/`) : url;
}

export function coverUrl(url: string, width: number): string {
  return cloudinary(url, `f_auto,q_auto,c_fill,g_center,w_${width},h_${width}`);
}

export function coverSrcset(url: string, widths: number[]): string {
  return widths.map((width) => `${coverUrl(url, width)} ${width}w`).join(", ");
}

// Shown at 48-80 css px in the archive, musician and search lists
export function coverThumb(url: string): string {
  return coverUrl(url, 160);
}

// Link previews: a plain JPEG, since not every service reads AVIF or WebP
export function shareImage(url: string): string {
  return cloudinary(url, "f_jpg,q_auto,c_fill,g_center,w_1000,h_1000");
}

export const SITE_IMAGES = {
  favicon: "https://res.cloudinary.com/urre/image/upload/v1794410436/jazztips/site/favicon.ico",
  iconSvg: "https://res.cloudinary.com/urre/image/upload/v1794410434/jazztips/site/icon.svg",
  icon192: "https://res.cloudinary.com/urre/image/upload/v1794410433/jazztips/site/icon-192.png",
  icon512: "https://res.cloudinary.com/urre/image/upload/v1794410433/jazztips/site/icon-512.png",
  jazzkonserterApp: "https://res.cloudinary.com/urre/image/upload/v1794410437/jazztips/site/jazzkonserter-app.webp",
};
