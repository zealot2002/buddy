import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Discover } from "@/pages/Discover";
import { WalkListen } from "@/pages/WalkListen";
import { Companions } from "@/pages/Companions";
import { Favorites } from "@/pages/Favorites";
import { StoryPlayer } from "@/pages/StoryPlayer";
import { Profile } from "@/pages/Profile";
import { StoriesPage } from "@/pages/StoriesPage";
import { PlaylistPage } from "@/pages/PlaylistPage";
import { BottomNav } from "@/components/BottomNav";

const MAIN_TAB_PATHS = ['/discover', '/walk', '/profile'];

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBottomNav = MAIN_TAB_PATHS.includes(location.pathname);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/walk" replace />} />
        <Route path="/walk" element={<WalkListen />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/playlist" element={<PlaylistPage />} />
        <Route path="/companions" element={<Companions />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/story/:id" element={<StoryPlayer />} />
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
