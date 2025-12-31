import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const response = await axios.get(url, {
      maxRedirects: 3,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const match =
      response.data.match(/https?:\/\/[^"]+\.mp4/) ||
      response.data.match(/https?:\/\/[^"']+m3u8/);

    if (match) {
      return res.json({ source: match[0] });
    } else {
      return res.json({ error: "Video link not found" });
    }
  } catch (e) {
    return res.status(500).json({ error: "Extraction failed" });
  }
}
