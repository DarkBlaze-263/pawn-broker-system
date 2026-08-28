import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const neumorphicComponents = {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      },
    },
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#3f51b5',
        light: '#7986cb',
        dark: '#303f9f',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
      },
      background: {
        default: 'transparent',
        paper: 'transparent',
      },
      text: {
        primary: '#1a1a24',
        secondary: '#5c6b7a',
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 18,
      h4: {
        fontSize: '2.8rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1.6rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.2rem',
      },
      subtitle2: {
        fontSize: '1.1rem',
      },
      body1: {
        fontSize: '1.2rem',
      },
      body2: {
        fontSize: '1rem',
      },
      button: {
        fontSize: '1.1rem',
        fontWeight: 600,
      }
    },
    components: neumorphicComponents,
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#8c9eff',
        light: '#b3c4ff',
        dark: '#536dfe',
      },
      secondary: {
        main: '#ff4081',
        light: '#ff79b0',
        dark: '#c51162',
      },
      background: {
        default: 'transparent',
        paper: 'transparent',
      },
      text: {
        primary: '#d1d1d1',
        secondary: '#a3b1c6',
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 24,
      h4: {
        fontSize: '3rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '2.2rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1.8rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '1.4rem',
      },
      subtitle2: {
        fontSize: '1.2rem',
      },
      body1: {
        fontSize: '1.3rem',
      },
      body2: {
        fontSize: '1.1rem',
      },
      button: {
        fontSize: '1.2rem',
        fontWeight: 600,
      }
    },
    components: neumorphicComponents,
  });

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
