import { Home, Search, PlusSquare, User, Compass, Shield, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

export const Navigation = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navItems = [
    { icon: Home, label: "Hjem", path: "/" },
    { icon: Compass, label: "Utforsk", path: "/explore" },
    { icon: PlusSquare, label: "Last opp", path: "/upload" },
    { icon: User, label: "Profil", path: "/profile" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, label: "Admin", path: "/admin" });
  }

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          {user && (
            <button
              onClick={() => signOut()}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs">Logg ut</span>
            </button>
          )}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border z-50 flex-col items-center py-8 gap-8">
        <Link to="/" className="mb-4">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-xl">
            T
          </div>
        </Link>
        
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors",
              location.pathname === item.path
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            title={item.label}
          >
            <item.icon className="h-6 w-6" />
          </Link>
        ))}
        
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="mt-auto text-muted-foreground hover:text-foreground"
            title="Logg ut"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        )}
      </nav>
    </>
  );
};
