import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Companions } from "@/pages/Companions";
import { Routes as RoutesPage } from "@/pages/Routes";
import { Favorites } from "@/pages/Favorites";
import { StoryPlayer } from "@/pages/StoryPlayer";
import { Profile } from "@/pages/Profile";
import { BottomNav } from "@/components/BottomNav";

const MainApp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-navy">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/companions" element={<Companions />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/story/:id" element={<StoryPlayer />} />
      </Routes>
      <BottomNav onNavigate={navigate} />
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
