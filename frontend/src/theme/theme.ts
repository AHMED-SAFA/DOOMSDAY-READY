import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            // MCU Dark Theme - Deep space with Avengers red & gold
            primary: {
              main: '#e53935', // Avengers Red
              light: '#ff6f60',
              dark: '#ab000d',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#ffc107', // Infinity Stone Gold
              light: '#fff350',
              dark: '#c79100',
              contrastText: '#000000',
            },
            background: {
              default: '#0a1929', // Deep cosmic blue
              paper: '#132f4c',   // Card background
            },
            text: {
              primary: '#f0f4f8',
              secondary: '#90caf9',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
          }
        : {
            // MCU Light Theme - Clean comic-style
            primary: {
              main: '#c62828', // Bold red
              light: '#ff5f52',
              dark: '#8e0000',
              contrastText: '#ffffff',
            },
            secondary: {
              main: '#1565c0', // Captain America blue
              light: '#5e92f3',
              dark: '#003c8f',
              contrastText: '#ffffff',
            },
            background: {
              default: '#f4f6f8',
              paper: '#ffffff',
            },
            text: {
              primary: '#1a2027',
              secondary: '#5a6978',
            },
            divider: 'rgba(0, 0, 0, 0.08)',
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark'
                ? '0 8px 24px rgba(0,0,0,0.4)'
                : '0 8px 24px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
