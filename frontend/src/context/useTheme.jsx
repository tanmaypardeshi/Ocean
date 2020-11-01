import { createContext, useState } from "react";

const ThemeContext = createContext()

const ThemeProvider = ({ children }) => {
    
    const [dark, setDark] = useState(localStorage.getItem("theme") === null || localStorage.getItem("theme") === "true")

    const toggleTheme = () => {
        setDark(!dark)
        localStorage.setItem("theme", !dark)
    }

    return (
        <ThemeContext.Provider value={{ dark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export { ThemeProvider, ThemeContext }