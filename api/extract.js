// ဤဖိုင်ကို 'api/extract.js' အဖြစ် သိမ်းဆည်းပါ
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL လိုအပ်ပါသည်' });
  }

  try {
    // Website ရဲ့ HTML ကို ရယူခြင်း
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const links = [];
    const title = $('h1').first().text().trim() || 'Movie Found';

    // HomieTV ရဲ့ download link များကို ရှာဖွေခြင်း
    // များသောအားဖြင့် link တွေက <a> tag ထဲမှာ ရှိတတ်ပါတယ်
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();

      // Download ဆွဲဖို့ဖြစ်နိုင်ခြေရှိတဲ့ link များကို စစ်ထုတ်ခြင်း
      if (href && (
          href.includes('mega.nz') || 
          href.includes('drive.google.com') || 
          href.includes('mediafire.com') ||
          text.includes('download') ||
          text.includes('720p') ||
          text.includes('1080p')
      )) {
        links.push({
          label: $(el).text().trim() || 'Download Link',
          url: href,
          provider: href.includes('mega') ? 'Mega.nz' : href.includes('google') ? 'G-Drive' : 'Direct Server',
          size: 'Unknown'
        });
      }
    });

    return res.status(200).json({ title, links });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Link များကို ရှာဖွေ၍ မရနိုင်ပါ' });
  }
}
