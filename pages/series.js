import data from "../series.json";
import VideoCard from "../components/VideoCard";

export default function Series() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Series</h1>
      {data.map((m, i) => (
        <VideoCard key={i} item={m} />
      ))}
    </div>
  );
}
