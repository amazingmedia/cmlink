import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");

  const extractLinks = async () => {
    if (!url) return alert("ကျေးဇူးပြု၍ Link ထည့်ပါ");
    
    setLoading(true);
    setError("");
    setLinks([]);
    
    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok || data.error) throw new Error(data.error);
      
      setTitle(data.title);
      setLinks(data.links);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">CMlink Extractor</h1>
        <p className="text-slate-500 mt-2">
          Download Link များကို ကလေးအတွက် ဘေးကင်းစွာ ရယူနိုင်ပါသည်
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="HomieTV / cmreel.com Link ထည့်ပါ..."
          className="w-full px-5 py-4 bg-slate-50 border rounded-2xl mb-4"
        />
        <button
          onClick={extractLinks}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-4 rounded-2xl"
        >
          {loading ? " ရှာနေသည်..." : "Link ရှာဖွေမည်"}
        </button>

        {error && (
          <p className="text-red-600 mt-4 text-sm">{error}</p>
        )}
      </div>

      {links.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-xl mb-8">
          <h2 className="font-bold text-xl mb-4 text-center">{title}</h2>

          <div className="grid gap-3">
            {links.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                className="p-4 bg-slate-50 border rounded-2xl flex justify-between"
              >
                {item.label}
                <span className="text-blue-600 font-bold">Link</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
