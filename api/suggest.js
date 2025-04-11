import axios from 'axios';

export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const allSuggestions = new Set();
  const variations = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const baseURL = `https://suggestqueries.google.com/complete/search?client=firefox&q=`;

  try {
    // Fetch base query
    const baseRes = await axios.get(baseURL + encodeURIComponent(query));
    baseRes.data[1].forEach((s) => allSuggestions.add(s));

    // Fetch variations
    await Promise.all(
      variations.map(async (char) => {
        const res = await axios.get(baseURL + encodeURIComponent(`${query} ${char}`));
        res.data[1].forEach((s) => allSuggestions.add(s));
      })
    );

    const final = Array.from(allSuggestions).slice(0, 100); // Limit to 100 suggestions
    res.status(200).json({ keyword: query, suggestions: final });
  } catch (error) {
    console.error("API error:", error.message);
    res.status(500).json({ error: 'Failed to fetch suggestions', message: error.message });
  }
}
