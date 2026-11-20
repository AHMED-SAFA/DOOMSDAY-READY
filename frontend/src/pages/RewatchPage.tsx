import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked,
  Search,
} from '@mui/icons-material';
import { getMovies, getRewatchOrder, updateMovie } from '../api/client';
import { ProgressBar } from '../components/ProgressBar';
import { PaginationControls } from '../components/PaginationControls';
import { Movie, RewatchOrder } from '../types';

export const RewatchPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [rewatchData, setRewatchData] = useState<RewatchOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
        const doomsday = data.find((m) =>
          m.title.toLowerCase().includes('doomsday')
        );
        if (doomsday) {
          setSelectedMovie(doomsday);
        }
      } catch (err: any) {
        setError('Failed to load movies.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!selectedMovie) {
      setRewatchData(null);
      return;
    }

    const fetchRewatchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRewatchOrder(selectedMovie.id);
        setRewatchData(data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || 'Failed to fetch rewatch order.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRewatchOrder();
  }, [selectedMovie]);

  const handleToggleWatched = async (movie: Movie) => {
    try {
      const updated = await updateMovie(movie.id, { watched: !movie.watched });

      if (rewatchData) {
        const updatedMovies = rewatchData.movies.map((m) =>
          m.id === updated.id ? updated : m
        );
        const watchedCount = updatedMovies.filter((m) => m.watched).length;
        const unwatchedRuntime = updatedMovies
          .filter((m) => !m.watched)
          .reduce((sum, m) => sum + m.runtime, 0);

        setRewatchData({
          ...rewatchData,
          movies: updatedMovies,
          watched_count: watchedCount,
          total_unwatched_runtime: unwatchedRuntime,
        });
      }

      setMovies((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } catch (err: any) {
      setError('Failed to update watched status.');
    }
  };

  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  };

  const filteredRewatchMovies = (rewatchData?.movies ?? []).filter((movie) =>
    `${movie.title} ${movie.release_year}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const paginatedRewatchMovies = filteredRewatchMovies.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Rewatch Plan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pick an MCU movie to calculate the optimal watch order for all its prerequisites.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Target Movie Selector */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Autocomplete
          options={movies}
          getOptionLabel={(option) => `${option.title} (${option.release_year})`}
          value={selectedMovie}
          onChange={(_, newValue) => {
            setSelectedMovie(newValue);
            setSearch('');
            setPage(1);
          }}
          loading={initialLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Target Movie"
              placeholder="Choose a movie to plan your rewatch for..."
              helperText="The list will show all prerequisites in topological order (earlier dependencies first)."
            />
          )}
        />
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !selectedMovie ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Select a target movie above to view your rewatch plan.
          </Typography>
        </Box>
      ) : rewatchData && rewatchData.movies.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Prerequisites Needed! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            "{selectedMovie.title}" has no prerequisite movies. You're ready to watch it directly!
          </Typography>
        </Paper>
      ) : rewatchData ? (
        <Box>
          {/* Progress Overview Card */}
          <Card sx={{ mb: 4, p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Rewatch Progress for {selectedMovie.title}
              </Typography>
              <ProgressBar
                watched={rewatchData.watched_count}
                total={rewatchData.total_count}
                remainingRuntime={rewatchData.total_unwatched_runtime}
              />
            </CardContent>
          </Card>

          {/* Ordered Watch List */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Viewing Order ({rewatchData.total_count} movies)
          </Typography>

          <TextField
            placeholder="Search rewatch list..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
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

          {filteredRewatchMovies.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              No movies match your search.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {paginatedRewatchMovies.map((movie, index) => (
                <Card
                  key={movie.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderLeft: movie.watched
                      ? '4px solid #4caf50'
                      : '4px solid #e53935',
                    opacity: movie.watched ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Step Number */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: movie.watched ? 'success.main' : 'primary.main',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    {(page - 1) * perPage + index + 1}
                  </Box>

                  {/* Movie Details */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        textDecoration: movie.watched ? 'line-through' : 'none',
                      }}
                    >
                      {movie.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={movie.release_year}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<AccessTime sx={{ fontSize: '0.9rem !important' }} />}
                        label={formatRuntime(movie.runtime)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  {/* Watched Checkbox */}
                  <Checkbox
                    checked={movie.watched}
                    onChange={() => handleToggleWatched(movie)}
                    icon={<RadioButtonUnchecked />}
                    checkedIcon={<CheckCircle color="success" />}
                  />
                </Card>
              ))}
            </Stack>
          )}
          {filteredRewatchMovies.length > 0 && (
            <PaginationControls
              count={filteredRewatchMovies.length}
              page={page}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={(size) => {
                setPerPage(size);
                setPage(1);
              }}
            />
          )}
        </Box>
      ) : null}
    </Box>
  );
};
