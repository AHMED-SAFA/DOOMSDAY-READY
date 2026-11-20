import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  ConfirmationNumber,
  LocalMovies,
  Menu as MenuIcon,
  Schedule,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Movies', path: '/movies', icon: <LocalMovies /> },
  { label: 'Rewatch Plan', path: '/rewatch', icon: <Schedule /> },
  { label: 'Booking', path: '/booking', icon: <ConfirmationNumber /> },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', pt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontWeight: 800,
          background: 'linear-gradient(45deg, #e53935 30%, #ffc107 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        ⚡ DOOMSDAY READY
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(229, 57, 53, 0.15)',
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: mode === 'dark' ? 'rgba(10, 25, 41, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 900,
                  letterSpacing: '.1rem',
                  background: 'linear-gradient(45deg, #e53935 30%, #ffc107 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ⚡ DOOMSDAY READY
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color:
                      location.pathname === item.path
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    borderBottom:
                      location.pathname === item.path
                        ? `2px solid ${theme.palette.primary.main}`
                        : '2px solid transparent',
                    borderRadius: 0,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Actions: Theme Toggle + Mobile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle theme">
                {mode === 'dark' ? <Brightness7 sx={{ color: '#ffc107' }} /> : <Brightness4 />}
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: mode === 'dark' ? 'rgba(10, 25, 41, 0.5)' : 'rgba(244, 246, 248, 0.8)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          ⚡ Doomsday Ready
        </Typography>
      </Box>
    </Box>
  );
};
