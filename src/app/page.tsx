import Filters from "./components/Filters";
import RecentMaps from "./components/RecentMaps";
import Projects from "./components/Projects";

export default function Home() {
  return (
    <div className="mt-6 ml-4 flex overflow-x-hidden">
      <Filters />
      <section className="w-full flex-1">
        <RecentMaps />
        <Projects />
      </section>
    </div>
  );
}
