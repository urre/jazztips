import { useState } from "react";
import Fuse from "fuse.js";

export default function Search({ searchList }) {

console.log(searchList);

  const [query, setQuery] = useState("");

  const options = {
    keys: [
      "data.title",
      "data.artist",
      "data.label",
      "data.credits.name",
      "data.credits.instrument",
      "data.description",
    ],
    threshold: 0.3,
  };

  const fuse = new Fuse(searchList, options);

  const posts = fuse
    .search(query)
    .map((result) => result.item)
    .slice(0, 10);

  function handleOnSearch({ target }) {
    setQuery(target.value);
  }

  return (
    <div className="search">
      <input
        type="search"
        value={query}
        onChange={handleOnSearch}
        placeholder="Search"
      />

      {query.length > 1 && (
        <ul className="search-list">
          {posts.map((post) => (
            <li key={post.data.title}>
              <a href={`${post.url}`} style={{display: 'flex', gap: '1rem'}}>

                <figure style={{width: '40px', height: '40px', flexShrink: '0', backgroundColor: '#f6f6f6' }}>
                  <img
                    src={post.data.image}
                    alt={post.data.title}
                    width={50}
                    height={50}
                    loading="lazy"
                    style={{width: '40px', height: '40px', display: 'block', objectFit: 'cover'}}
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
