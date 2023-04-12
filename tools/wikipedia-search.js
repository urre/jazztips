async function searchWikipedia(searchQuery) {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  return json;
}

async function doSearch() {
  const inputValue = "miles davis";
  const searchQuery = inputValue.trim();

  try {
    const results = await searchWikipedia(searchQuery);

    console.log(results.query.search[0]);
  } catch (err) {
    console.log(err);

    alert("Failed to search wikipedia");
  }
}

doSearch();
