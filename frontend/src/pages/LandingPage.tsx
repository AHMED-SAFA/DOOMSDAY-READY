import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ConfirmationNumber,
  LocalMovies,
  Schedule,
  Speed,
  TrendingUp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  const features = [
    {
      icon: <LocalMovies sx={{ fontSize: 48, color: '#e53935' }} />,
      title: 'Track Movies',
      description:
        'Manage your MCU watchlist. Add movies, mark them as watched, and set up prerequisites so you never lose track of the Marvel Cinematic Universe.',
      action: 'Manage Movies',
      link: '/movies',
    },
    {
      icon: <Schedule sx={{ fontSize: 48, color: '#ffc107' }} />,
      title: 'Rewatch Plan',
      description:
        'Get the perfect viewing order for any movie using topological sorting. Track your progress with live watch-time calculations and progress bars.',
      action: 'Plan Rewatch',
      link: '/rewatch',
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 48, color: '#4caf50' }} />,
      title: 'Book Seats',
      description:
        'Find the optimal combination of opening-night bundles for your watch party using dynamic programming. Zero wasted seats, guaranteed.',
      action: 'Book Party',
      link: '/booking',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, md: 600 },
            height: { xs: 200, md: 300 },
            background:
              mode === 'dark'
                ? 'radial-gradient(ellipse at center, rgba(229, 57, 53, 0.15) 0%, rgba(255, 193, 7, 0.05) 50%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(229, 57, 53, 0.08) 0%, rgba(255, 193, 7, 0.03) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.2em',
              color: 'primary.main',
              display: 'block',
              mb: 1,
            }}
          >
            AVENGERS: DOOMSDAY PREPARATION
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 2,
              background: 'linear-gradient(135deg, #e53935 0%, #ff6f60 50%, #ffc107 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DOOMSDAY READY
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
            }}
          >
            Plan your MCU rewatch order before Avengers: Doomsday drops.
            Calculate optimal watch party bundles with zero empty seats.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              component={Link}
              to="/rewatch"
              variant="contained"
              size="large"
              color="primary"
              startIcon={<Speed />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Plan Rewatch
            </Button>
            <Button
              component={Link}
              to="/booking"
              variant="outlined"
              size="large"
              startIcon={<ConfirmationNumber />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              Book Watch Party
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Feature Cards */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2,
                  bgcolor:
                    mode === 'dark'
                      ? 'rgba(19, 47, 76, 0.6)'
                      : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, mb: 3 }}
                  >
                    {feature.description}
                  </Typography>
                  <Button
                    component={Link}
                    to={feature.link}
                    variant="text"
                    color="primary"
                    endIcon={<TrendingUp />}
                  >
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
