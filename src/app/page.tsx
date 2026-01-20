import Filters from "./components/Filters"
import RecentMaps from "./components/RecentMaps";

export default function Home() {
  return (
    <div id="main-page" className="flex">
      <Filters/>
      <section id="hero-section" className="">
        <RecentMaps/>
      </section>
    </div>
  );
}
