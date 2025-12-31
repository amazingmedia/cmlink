import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL လိုအပ်ပါသည်' });

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Referer': 'https://www.google.com/'
            }
        });

        const $ = cheerio.load(response.data);
        const links = [];
        const title = $('h1').first().text().trim() || 'ရုပ်ရှင်အမည်ရှာမတွေ့ပါ';

        // ၁။ <a> tags အားလုံးကို စစ်ဆေးခြင်း
        $('a, button, [data-link], [data-url]').each((i, el) => {
            let href = $(el).attr('href') || $(el).attr('data-link') || $(el).attr('data-url');
            const text = $(el).text().trim();
            const lowerText = text.toLowerCase();

            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

            // Absolute URL ဖြစ်အောင် ပြုလုပ်ခြင်း
            if (href.startsWith('/')) {
                const base = new URL(url).origin;
                href = base + href;
            }

            // Download Link ဖြစ်နိုင်ခြေရှိသော pattern များ
            const isPotentialLink = 
                href.includes('mega.nz') || 
                href.includes('drive.google.com') || 
                href.includes('mediafire.com') ||
                href.includes('t.me') ||
                href.includes('download') || 
                href.includes('dl-') ||
                lowerText.includes('download') || 
                lowerText.includes('ရယူရန်') ||
                lowerText.includes('720p') || 
                lowerText.includes('1080p');

            if (isPotentialLink && href.startsWith('http')) {
                links.push({
                    label: text || 'Download Link',
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

        return res.status(200).json({ title, links: uniqueLinks, count: uniqueLinks.length });

    } catch (error) {
        return res.status(500).json({ error: 'မူရင်း Website မှ အချက်အလက်ယူ၍မရပါ။ Website က ပိတ်ထားခြင်း ဖြစ်နိုင်ပါသည်။' });
    }
}
