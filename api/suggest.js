// api/suggest.js

import axios from "axios";

export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const all = new Set();
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  const baseURL = `https://suggestqueries.google.com/complete/search?client=firefox&q=`;

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchFromGoogle = async (q) => {
    try {
      const url = baseURL + encodeURIComponent(q);
      const response = await axios.get(url, { timeout: 4000 });
      if (response.data[1]) {
        response.data[1].forEach(s => all.add(s));
      }
    } catch (err) {
      console.error("❌ Error on", q, err.message);
    }
  };

  try {
    // 1. Base keyword
    await fetchFromGoogle(query);

    // 2. Keyword + a-z (one-by-one with delay)
    for (let char of alphabet) {
      await fetchFromGoogle(`${query} ${char}`);
      await delay(100); // 100ms pause = safer
    }

    const final = Array.from(all).slice(0, 100);
    res.status(200).json({ keyword: query, suggestions: final });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Failed to fetch suggestions", details: err.message });
  }
}
