export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL မထည့်ရသေးပါ" });

    const response = await fetch(url);
    const html = await response.text();

    const links = [];
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/ *\|.*/, "").trim() : "Unknown Title";

    // Regular Expression to find MP4 / M3U8 / Stream links
    const regex = /(https?:\/\/[^\s"']+\.(mp4|m3u8|ts)[^\s"']*)/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      links.push({
        url: match[1],
        label: match[1].split("/").pop(),
        provider: new URL(match[1]).hostname
      });
    }

    if (links.length === 0) {
      return res.status(404).json({
        title,
        links: [],
        message: "Download Link မတွေ့ပါ"
      });
    }

    res.status(200).json({
      title,
      links
    });

  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({
      error: "Server Error: " + err.message
    });
  }
}
