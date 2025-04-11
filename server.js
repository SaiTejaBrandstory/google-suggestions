const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// GET /api/suggest?q=keyword
app.get("/api/suggest", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing keyword" });

  const allSuggestions = new Set();
  const variations = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  const baseURL = `https://suggestqueries.google.com/complete/search?client=firefox&q=`;

  const getSuggestions = async (term) => {
    try {
      const response = await axios.get(baseURL + encodeURIComponent(term), {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      response.data[1].forEach(s => allSuggestions.add(s));
    } catch (err) {
      console.warn(`Error for "${term}" - skipping`);
    }
  };

  try {
    await getSuggestions(query);

    for (const ch of variations) {
      await new Promise(r => setTimeout(r, 100)); // throttle
      await getSuggestions(`${query} ${ch}`);
    }

    res.json({
      keyword: query,
      suggestions: Array.from(allSuggestions).slice(0, 150),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
