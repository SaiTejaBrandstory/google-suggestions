// api/suggest.js

import axios from 'axios';

export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const variations = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const allSuggestions = new Set();

  const baseURL = `https://suggestqueries.google.com/complete/search?client=firefox&q=`;

  try {
    // fetch base query
    const baseRes = await axios.get(baseURL + encodeURIComponent(query));
    baseRes.data[1].forEach((s) => allSuggestions.add(s));

    // fetch variations
    await Promise.all(
      variations.map(async (char) => {
        const res = await axios.get(baseURL + encodeURIComponent(`${query} ${char}`));
        res.data[1].forEach((s) => allSuggestions.add(s));
      })
    );

    const final = Array.from(allSuggestions).slice(0, 100);
    res.json({ keyword: query, suggestions: final });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
