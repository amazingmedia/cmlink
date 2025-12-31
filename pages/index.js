import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>CMlink Streaming</h1>
      <Link href="/movie">Movies</Link>
      <br />
      <Link href="/series">Series</Link>
    </div>
  );
}
