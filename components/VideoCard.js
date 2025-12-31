import Link from "next/link";

export default function VideoCard({ item }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <img src={item.thumbnail} width="200" />
      <h3>{item.title}</h3>
      <Link href={`/api/extract?url=${encodeURIComponent(item.url)}`}>
        ▶ Play Now
      </Link>
    </div>
  );
}
