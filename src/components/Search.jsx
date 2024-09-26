import React, { useState } from 'react';
import Fuse from 'fuse.js';  // Assuming you're using Fuse.js for search functionality

function Search({ searchList }) {
  // User's input state
  const [query, setQuery] = useState('');

  // Fuse.js options
  const options = {
    keys: ['frontmatter.title', 'frontmatter.description'], // Search in these fields
    threshold: 0.3,  // Adjust the threshold for search sensitivity
  };

  const fuse = new Fuse(searchList, options);

  // Limit the search results to 5 posts
  const posts = fuse
    .search(query)
    .map((result) => result.item)
    .slice(0, 5);

  function handleOnSearch({ target }) {
    setQuery(target.value);  // Update query state on input change
  }

  return (
    <>
      <label>Search</label>
      <input
        type="text"
        value={query}
        onChange={handleOnSearch}
        placeholder="Search posts"
      />
      {query.length > 1 && (
        <p>
          Found {posts.length} {posts.length === 1 ? 'result' : 'results'} for '{query}'
        </p>
      )}
      <ul>
        {posts.map((post) => (
          <li key={post.frontmatter.slug}>
            <a href={`/${post.frontmatter.slug}`}>{post.frontmatter.title}</a>
            <p>{post.frontmatter.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Search;
