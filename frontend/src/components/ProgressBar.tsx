import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface ProgressBarProps {
  watched: number;
  total: number;
  remainingRuntime: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  watched,
  total,
  remainingRuntime,
}) => {
  const percentage = total > 0 ? Math.round((watched / total) * 100) : 0;

  const formatRuntime = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Progress: {watched} of {total} watched ({percentage}%)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Remaining: {formatRuntime(remainingRuntime)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            background:
              percentage === 100
                ? '#4caf50'
                : 'linear-gradient(90deg, #e53935, #ffc107)',
          },
        }}
      />
    </Box>
  );
};
