import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import History from "./pages/History";
import Compare from "./pages/Compare";
import { cn } from "./lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/history", label: "History" },
  { to: "/compare", label: "Compare" },
];

function Nav() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-bg/70 border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Stride<span className="text-accent">.</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "px-3 py-1.5 rounded-md transition",
                pathname === n.to
                  ? "bg-surface-2 text-fg"
                  : "text-muted-fg hover:text-fg hover:bg-surface",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <main className="flex-1 container py-8 animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
      <footer className="py-6 text-center text-xs text-muted-fg">
        Built for one runner. Calibrated for iPhone clips.
      </footer>
    </div>
  );
}
