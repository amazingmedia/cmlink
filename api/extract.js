import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS သတ်မှတ်ချက်များ (Frontend မှ လှမ်းခေါ်နိုင်ရန်)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Movie URL လိုအပ်ပါသည်' });
  }

  try {
    // Website bot အဖြစ် မသတ်မှတ်အောင် Browser တစ်ခုလို Header ပို့ပြီး ဒေတာရယူခြင်း
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const $ = cheerio.load(response.data);
    const links = [];
    
    // ရုပ်ရှင်ခေါင်းစဉ်ကို ရယူခြင်း (h1 tag သို့မဟုတ် Open Graph title မှ ရှာဖွေခြင်း)
    const title = $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  'ရုပ်ရှင်အမည်ရှာမတွေ့ပါ';

    // Website ထဲရှိ Link အားလုံးကို စစ်ဆေးပြီး Download link များကို ရှာဖွေခြင်း
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().toLowerCase();

      if (!href || !href.startsWith('http')) return;

      // လူသုံးများသော Storage site များနှင့် Keywords များ ပါဝင်မှု ရှိမရှိ စစ်ဆေးခြင်း
      const isDownloadLink = 
        href.includes('mega.nz') || 
        href.includes('drive.google.com') || 
        href.includes('mediafire.com') ||
        href.includes('t.me') ||
        text.includes('download') || 
        text.includes('dl link') ||
        text.includes('720p') || 
        text.includes('1080p');

      if (isDownloadLink) {
        links.push({
          label: $(el).text().trim() || 'Download Link',
          url: href,
          provider: href.includes('mega') ? 'Mega.nz' : 
                    href.includes('google') ? 'G-Drive' : 
                    href.includes('mediafire') ? 'Mediafire' : 'Direct Link'
        });
      }
    });

    // ထပ်နေသော Link များကို ဖယ်ထုတ်ခြင်း
    const uniqueLinks = Array.from(new Set(links.map(a => a.url)))
                             .map(url => links.find(a => a.url === url));

    return res.status(200).json({ 
      title, 
      links: uniqueLinks 
    });

  } catch (error) {
    console.error("Scraping Error:", error.message);
    
    // Error အမျိုးအစားအလိုက် အကြောင်းပြန်ခြင်း
    const status = error.response ? error.response.status : 500;
    const errorMsg = status === 403 ? 'မူရင်း Website မှ ခွင့်မပြုပါ (Access Forbidden)' : 'မူရင်း Website ကို ချိတ်ဆက်၍မရပါ သို့မဟုတ် Website က ပိတ်ထားပါသည်။';
    
    return res.status(status).json({ error: errorMsg });
  }
}
