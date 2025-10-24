import { Home, Search, PlusSquare, User, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Hjem", path: "/" },
    { icon: Compass, label: "Utforsk", path: "/utforsk" },
    { icon: PlusSquare, label: "Last opp", path: "/last-opp" },
    { icon: User, label: "Profil", path: "/profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:top-0 md:bottom-auto md:left-0 md:w-20 md:h-screen md:border-r md:border-t-0">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-full md:py-8">
        {/* Logo on desktop */}
        <div className="hidden md:block mb-8">
          <Link to="/" className="flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-xl">
              T
            </div>
          </Link>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-secondary",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current stroke-2")} />
              <span className="text-xs hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
