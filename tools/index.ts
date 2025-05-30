import { fetchStreamingLinks } from "./fetchStreamingLinks";

const links = await fetchStreamingLinks("Jon Batiste", "We Are");

console.log(links);
