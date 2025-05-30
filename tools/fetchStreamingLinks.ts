import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import * as dotenv from "dotenv";
dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY!;


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
});

async function fetchSpotifyAlbumLink(
  artist: string,
  album: string
): Promise<string | null> {
  try {
    const tokenData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(tokenData.body.access_token);

    const result = await spotifyApi.searchAlbums(`${album} ${artist}`, {
      limit: 1,
    });
    const found = result.body.albums?.items?.[0];

    return found?.external_urls?.spotify || null;
  } catch (err: any) {
    console.warn("Spotify fetch failed:", err.message);
    return null;
  }
}

async function fetchAppleMusicAlbumLink(
  artist: string,
  album: string
): Promise<string | null> {
  try {
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: `${artist} ${album}`,
        media: "music",
        entity: "album",
        limit: 1,
      },
    });

    return response.data.results[0]?.collectionViewUrl.replace('music.apple', 'embed.music.apple') || null;
  } catch (err: any) {
    console.warn("Apple Music fetch failed:", err.message);
    return null;
  }
}

export async function fetchTidalAlbumLink(artist: string, album: string): Promise<string | null> {
  try {
    const query = `Tidal album ${artist} ${album}`;

    const response = await axios.post("https://api.tavily.com/search", {
      api_key: TAVILY_API_KEY,
      query,
      max_results: 5,
      include_answer: false
    });

    const links: string[] = response.data.results.map((r: any) => r.url);

    // Filter for Tidal album URLs
    const tidalLink = links.find(url =>
      url.includes("tidal.com") && url.includes("/album/")
    );

    return tidalLink || null;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("Tavily Tidal search failed:", message);
    return null;
  }
}

export async function fetchStreamingLinks(artist: string, album: string) {
  const [spotify, apple, tidal] = await Promise.all([
    fetchSpotifyAlbumLink(artist, album),
    fetchAppleMusicAlbumLink(artist, album),
    fetchTidalAlbumLink(artist, album),
  ]);

  return { spotify, apple, tidal };
}
