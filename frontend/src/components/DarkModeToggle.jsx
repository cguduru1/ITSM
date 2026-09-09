import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const toggle = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button className="dark-toggle" onClick={toggle}>
      {dark ? (
        <i className="ri-moon-fill"></i>
      ) : (
        <i className="ri-sun-fill"></i>
      )}
    </button>
  );
}
