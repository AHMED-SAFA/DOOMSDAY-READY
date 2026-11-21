import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  Grid,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { createMovie, getMovies, updateMovie } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { MovieDialog } from '../components/MovieDialog';
import { PaginationControls } from '../components/PaginationControls';
import { Movie } from '../types';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: 'Failed to load movies.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleToggleWatched = async (movie: Movie) => {
    try {
      const updated = await updateMovie(movie.id, { watched: !movie.watched });
      setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSnackbar({
        open: true,
        message: `Marked "${movie.title}" as ${!movie.watched ? 'watched' : 'unwatched'}.`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: 'Failed to update watched status.',
        severity: 'error',
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingMovie(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setDialogOpen(true);
  };

  const handleSaveMovie = async (data: {
    title: string;
    release_year: number;
    runtime: number;
    watched: boolean;
    prerequisites: number[];
  }) => {
    if (editingMovie) {
      const updated = await updateMovie(editingMovie.id, data);
      setMovies((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      setSnackbar({
        open: true,
        message: `Updated "${data.title}".`,
        severity: 'success',
      });
    } else {
      const created = await createMovie(data);
      setMovies((prev) => [...prev, created]);
      setSnackbar({
        open: true,
        message: `Created "${data.title}".`,
        severity: 'success',
      });
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedMovies = filteredMovies.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            MCU Movies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Marvel movies, prerequisites, and watch status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Add Movie
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        placeholder="Search movies..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredMovies.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {search ? 'No movies match your search.' : 'No movies found.'}
          </Typography>
          {!search && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              sx={{ mt: 2 }}
            >
              Add your first movie
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {paginatedMovies.map((movie) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={movie.id}>
              <MovieCard
                movie={movie}
                onToggleWatched={handleToggleWatched}
                onEdit={handleOpenEdit}
              />
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && filteredMovies.length > 0 && (
        <PaginationControls
          count={filteredMovies.length}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleOpenCreate}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { sm: 'none' },
        }}
      >
        <Add />
      </Fab>

      {/* Movie Create/Edit Dialog */}
      <MovieDialog
        open={dialogOpen}
        movie={editingMovie}
        allMovies={movies}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMovie}
      />

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
