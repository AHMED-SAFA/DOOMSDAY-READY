import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import { Movie } from '../types';

interface MovieDialogProps {
  open: boolean;
  movie: Movie | null; // null for create mode
  allMovies: Movie[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    release_year: number;
    runtime: number;
    watched: boolean;
    prerequisites: number[];
  }) => Promise<void>;
}

export const MovieDialog: React.FC<MovieDialogProps> = ({
  open,
  movie,
  allMovies,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState<number | ''>(2024);
  const [runtime, setRuntime] = useState<number | ''>(120);
  const [watched, setWatched] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(movie);

  const availablePrereqs = allMovies.filter((m) => !movie || m.id !== movie.id);

  useEffect(() => {
    if (movie) {
      setTitle(movie.title);
      setReleaseYear(movie.release_year);
      setRuntime(movie.runtime);
      setWatched(movie.watched);
      const prereqs = allMovies.filter((m) =>
        movie.prerequisites.includes(m.id)
      );
      setSelectedPrereqs(prereqs);
    } else {
      setTitle('');
      setReleaseYear(new Date().getFullYear());
      setRuntime(120);
      setWatched(false);
      setSelectedPrereqs([]);
    }
    setError(null);
  }, [movie, allMovies, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!releaseYear || releaseYear < 1900 || releaseYear > 2100) {
      setError('Please enter a valid release year (1900–2100).');
      return;
    }
    if (!runtime || runtime < 1 || runtime > 300) {
      setError('Runtime must be between 1 and 300 minutes.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        release_year: Number(releaseYear),
        runtime: Number(runtime),
        watched,
        prerequisites: selectedPrereqs.map((p) => p.id),
      });
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(
          'Circular dependency detected! A movie cannot depend on itself, directly or indirectly.'
        );
      } else if (err.response?.data?.title) {
        setError(`Title error: ${err.response.data.title.join(', ')}`);
      } else {
        setError(
          err.response?.data?.detail ||
            err.message ||
            'Failed to save movie. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Movie Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Release Year"
                type="number"
                value={releaseYear}
                onChange={(e) =>
                  setReleaseYear(e.target.value === '' ? '' : Number(e.target.value))
                }
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1900, max: 2100 } }}
              />
              <TextField
                label="Runtime (minutes)"
                type="number"
                value={runtime}
                onChange={(e) =>
                  setRuntime(e.target.value === '' ? '' : Number(e.target.value))
                }
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1, max: 300 } }}
                helperText="1–300 mins"
              />
            </Stack>

            <Autocomplete
              multiple
              options={availablePrereqs}
              getOptionLabel={(option) => `${option.title} (${option.release_year})`}
              value={selectedPrereqs}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, newValue) => setSelectedPrereqs(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Prerequisites (Watch These First)"
                  placeholder="Select movies..."
                  helperText="Movies that should be watched before this one"
                />
              )}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={watched}
                  onChange={(e) => setWatched(e.target.checked)}
                  color="success"
                />
              }
              label="Already watched"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
