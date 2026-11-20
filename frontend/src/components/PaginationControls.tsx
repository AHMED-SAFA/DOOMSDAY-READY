import React from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
} from '@mui/material';

interface PaginationControlsProps {
  count: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  count,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}) => {
  const pageCount = Math.ceil(count / perPage);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ mt: 3, alignItems: 'center', justifyContent: 'space-between' }}
    >
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id="display-per-page-label">Display per page</InputLabel>
        <Select
          labelId="display-per-page-label"
          value={perPage}
          label="Display per page"
          onChange={(event) => onPerPageChange(Number(event.target.value))}
        >
          {[6, 12, 24, 50, 100].map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          color="primary"
        />
      )}
    </Stack>
  );
};
