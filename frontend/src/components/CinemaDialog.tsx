import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';

interface CinemaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; bundle_sizes: number[] }) => Promise<void>;
}

export const CinemaDialog: React.FC<CinemaDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [bundleSizeInput, setBundleSizeInput] = useState('');
  const [bundleSizes, setBundleSizes] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddBundleSize = () => {
    const size = parseInt(bundleSizeInput.trim(), 10);
    if (isNaN(size) || size < 1 || size > 500) {
      setError('Bundle size must be between 1 and 500.');
      return;
    }
    if (bundleSizes.includes(size)) {
      setError('Bundle size already added.');
      return;
    }
    if (bundleSizes.length >= 10) {
      setError('Maximum 10 bundle sizes allowed.');
      return;
    }

    setBundleSizes([...bundleSizes, size].sort((a, b) => a - b));
    setBundleSizeInput('');
    setError(null);
  };

  const handleRemoveBundleSize = (sizeToRemove: number) => {
    setBundleSizes(bundleSizes.filter((s) => s !== sizeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Cinema name is required.');
      return;
    }
    if (bundleSizes.length === 0) {
      setError('Please add at least one bundle size.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        bundle_sizes: bundleSizes,
      });
      // Reset form
      setName('');
      setBundleSizes([]);
      setBundleSizeInput('');
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.name?.join(', ') ||
          err.response?.data?.bundle_sizes?.join(', ') ||
          err.message ||
          'Failed to create cinema.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Cinema</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Cinema Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bundle Sizes (1–10 sizes, each 1–500 seats)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                  label="Bundle Size"
                  type="number"
                  value={bundleSizeInput}
                  onChange={(e) => setBundleSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBundleSize();
                    }
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 500 } }}
                  size="small"
                  sx={{ width: 160 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddBundleSize}
                  startIcon={<Add />}
                >
                  Add Size
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: 32 }}>
                {bundleSizes.map((size) => (
                  <Chip
                    key={size}
                    label={`${size} seats`}
                    onDelete={() => handleRemoveBundleSize(size)}
                    deleteIcon={<Close />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                {bundleSizes.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No bundle sizes added yet.
                  </Typography>
                )}
              </Box>
            </Box>
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
            {loading ? 'Creating...' : 'Create Cinema'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
