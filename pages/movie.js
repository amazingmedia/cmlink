import data from "../movies.json";
import VideoCard from "../components/VideoCard";

export default function Movie() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Movies</h1>
      {data.map((m, i) => (
        <VideoCard key={i} item={m} />
      ))}
    </div>
  );
}
