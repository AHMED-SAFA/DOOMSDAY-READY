import React from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { TheaterComedy } from '@mui/icons-material';
import { Cinema } from '../types';

interface CinemaCardProps {
  cinema: Cinema;
  selected?: boolean;
  onSelect?: (cinema: Cinema) => void;
}

export const CinemaCard: React.FC<CinemaCardProps> = ({
  cinema,
  selected,
  onSelect,
}) => {
  return (
    <Card
      onClick={() => onSelect?.(cinema)}
      sx={{
        cursor: onSelect ? 'pointer' : 'default',
        border: selected ? '2px solid' : '1px solid transparent',
        borderColor: selected ? 'primary.main' : undefined,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TheaterComedy color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            {cinema.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Available Bundle Sizes:
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {cinema.bundle_sizes.map((size) => (
            <Chip
              key={size}
              label={`${size} seats`}
              size="small"
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
