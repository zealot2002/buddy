import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Companions } from "@/pages/Companions";
import { Favorites } from "@/pages/Favorites";
import { StoryPlayer } from "@/pages/StoryPlayer";
import { Profile } from "@/pages/Profile";
import { MapPage } from "@/pages/MapPage";
import { StoriesPage } from "@/pages/StoriesPage";
import { BottomNav } from "@/components/BottomNav";

const MAIN_TAB_PATHS = ['/', '/profile'];

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBottomNav = MAIN_TAB_PATHS.includes(location.pathname);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/companions" element={<Companions />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/story/:id" element={<StoryPlayer />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
      {showBottomNav && <BottomNav onNavigate={navigate} />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
