import React from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { AccessTime, Edit, Movie as MovieIcon } from '@mui/icons-material';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onToggleWatched: (movie: Movie) => void;
  onEdit: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onToggleWatched,
  onEdit,
}) => {
  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        opacity: movie.watched ? 0.75 : 1,
        border: movie.watched ? '1px solid rgba(76, 175, 80, 0.3)' : undefined,
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header: Title + Year */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MovieIcon color={movie.watched ? 'success' : 'primary'} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                textDecoration: movie.watched ? 'line-through' : 'none',
              }}
            >
              {movie.title}
            </Typography>
          </Box>
        </Box>

        {/* Metadata: Year and Runtime */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Chip
            label={movie.release_year}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            icon={<AccessTime sx={{ fontSize: '1rem !important' }} />}
            label={formatRuntime(movie.runtime)}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Prerequisites */}
        {movie.prerequisite_details && movie.prerequisite_details.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Requires:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {movie.prerequisite_details.map((p) => (
                <Chip
                  key={p.id}
                  label={p.title}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pt: 0, pb: 1.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={movie.watched}
              onChange={() => onToggleWatched(movie)}
              color="success"
            />
          }
          label={
            <Typography variant="body2" color={movie.watched ? 'success.main' : 'text.secondary'}>
              {movie.watched ? 'Watched' : 'Mark watched'}
            </Typography>
          }
        />
        <Tooltip title="Edit movie & prerequisites">
          <IconButton size="small" onClick={() => onEdit(movie)} color="primary">
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
