import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() =>
        localStorage.getItem("offly-theme") || "dark"
    );

    useEffect(() => {
        localStorage.setItem("offly-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        document.body.style.background = theme === "dark"
            ? "linear-gradient(135deg,#0a0f1e 0%,#0d1528 40%,#0a1a2e 70%,#060d1a 100%)"
            : "#f0f4f8";
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
    const isDark = theme === "dark";

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);