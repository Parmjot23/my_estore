"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        setTheme("dark");
      } else {
        document.documentElement.classList.remove("dark");
        setTheme("light");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="text-gray-700 hover:text-accent dark:text-gray-200"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
