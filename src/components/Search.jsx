import { useEffect, useState } from "react";
import Fuse from "fuse.js";

export default function Search({ searchList }) {
  const [query, setQuery] = useState("");

  // Get the search query from the URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("query") || ""; // Get the query parameter or default to empty string
    setQuery(initialQuery);
  }, []);

  // Update the URL when the query changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (query) {
      urlParams.set("query", query); // Update URL with the query
    } else {
      urlParams.delete("query"); // Remove query parameter if it's empty
    }
    window.history.replaceState(null, "", "?" + urlParams.toString()); // Modify URL without reloading
  }, [query]);

  const options = {
    keys: [
      "data.title",
      "data.artist",
      "data.label",
      "data.credits.name",
      "data.credits.instrument",
      "data.description",
    ],
    threshold: 0.3, // Adjust threshold for search accuracy
  };

  const fuse = new Fuse(searchList, options);

  // Get the search results based on the query
  const posts = fuse
    .search(query)
    .map((result) => result.item)
    .slice(0, 10); // Limit the number of posts shown to 10

  // Handle the input change in search box
  const handleOnSearch = (event) => {
    setQuery(event.target.value);
  };

  // Handle key press events to close search with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setQuery(""); // Clear the search query when Escape is pressed
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="search">
      <input
        type="search"
        value={query} // Input value is controlled by `query` state
        onChange={handleOnSearch} // Update state when the user types
        placeholder="Search"
      />

      {/* Display search results only when query length is greater than 1 */}
      {query.length > 1 && (
        <ul className="search-list">
          {posts.map((post) => (
            <li key={post.id}> {/* Assuming each post has a unique `id` */}
              <a href={`/${post.id}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center'  }}>
                <figure style={{ width: '80px', height: '80px', flexShrink: '0', backgroundColor: '#f6f6f6' }}>
                  <img
                    src={post.data.image}
                    alt={post.data.title}
                    width={100}
                    height={100}
                    loading="lazy"
                    style={{
                      width: '80px',
                      height: '80px',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                </figure>
                <div>
                  {post.data.artist} - {post.data.title}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
