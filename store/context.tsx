import {ReactNode} from 'react';
import {createContext, useState} from 'react';
import {theme, darkTheme} from '../components/themes';

interface Modal {
  children?: ReactNode;
  darkMode: Boolean;
  // children: Element;
  theme: {
    colors: string;
    spacing: number;
    textVariants: any;
  };

}


const ThemeContext = createContext({});

const ThemeContextProvider = ({children}: Modal) => {
  const [darkMode, setDarkMode] = useState(false);
  const mainTheme = darkMode ? darkTheme : theme;
  console.log('setDarkMode',darkMode)
  return (
    <ThemeContext.Provider value={{mainTheme, setDarkMode, darkMode}}>
      {children}
    </ThemeContext.Provider>
  );
};

export {ThemeContext, ThemeContextProvider};