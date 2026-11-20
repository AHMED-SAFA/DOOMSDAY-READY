import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  ReportProblem,
} from '@mui/icons-material';
import { createCinema, getBookingQuote, getCinemas } from '../api/client';
import { CinemaCard } from '../components/CinemaCard';
import { CinemaDialog } from '../components/CinemaDialog';
import { BookingQuote, Cinema } from '../types';

export const BookingPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [groupSize, setGroupSize] = useState<number | ''>(6);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const data = await getCinemas();
      setCinemas(data);
      if (data.length > 0 && !selectedCinema) {
        setSelectedCinema(data[0]);
      }
    } catch (err: any) {
      setError('Failed to load cinemas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleGetQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCinema || !groupSize || groupSize < 1) return;

    setQuoteLoading(true);
    setError(null);
    try {
      const data = await getBookingQuote(selectedCinema.id, Number(groupSize));
      setQuote(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to calculate booking quote.'
      );
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCreateCinema = async (data: {
    name: string;
    bundle_sizes: number[];
  }) => {
    const created = await createCinema(data);
    setCinemas((prev) => [...prev, created]);
    setSelectedCinema(created);
  };

  return (
    <Box>
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
            Watch-Party Booking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find the optimal seat bundles for your group with zero wasted seats.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Cinema
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Cinema Selection */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              1. Choose a Cinema
            </Typography>
            <Stack spacing={2}>
              {cinemas.map((cinema) => (
                <CinemaCard
                  key={cinema.id}
                  cinema={cinema}
                  selected={selectedCinema?.id === cinema.id}
                  onSelect={setSelectedCinema}
                />
              ))}
              {cinemas.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No cinemas available. Add one to get started!
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Group Size & Quote */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              2. Enter Group Size & Get Quote
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handleGetQuote}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Group Size (seats needed)"
                    type="number"
                    value={groupSize}
                    onChange={(e) =>
                      setGroupSize(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    slotProps={{ htmlInput: { min: 1, max: 10000 } }}
                    fullWidth
                    required
                    helperText="Enter a group size between 1 and 10,000"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={
                      !selectedCinema ||
                      !groupSize ||
                      groupSize < 1 ||
                      quoteLoading
                    }
                  >
                    {quoteLoading ? 'Calculating...' : 'Calculate Bundles'}
                  </Button>
                </Stack>
              </form>
            </Paper>

            {/* Results Area */}
            {quote && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  3. Optimal Bundle Combination
                </Typography>

                {quote.possible ? (
                  <Card
                    sx={{
                      p: 2,
                      border: '2px solid #4caf50',
                      bgcolor: 'rgba(76, 175, 80, 0.05)',
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                        <CheckCircle color="success" />
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                          Exact Seating Found!
                        </Typography>
                      </Stack>

                      <Typography variant="body1" sx={{ mb: 2 }}>
                        For a group of <strong>{quote.group_size}</strong> people at{' '}
                        <strong>{selectedCinema?.name}</strong>, you need a minimum of{' '}
                        <strong>{quote.total_bundles}</strong> bundle(s):
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Bundles to Buy:
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {quote.bundles &&
                          Object.entries(quote.bundles)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([size, count]) => (
                              <Chip
                                key={size}
                                label={`${count} × [${size}-seat bundle] = ${Number(size) * count} seats`}
                                color="success"
                                sx={{ fontSize: '0.9rem', py: 2 }}
                              />
                            ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    sx={{
                      p: 2,
                      border: '2px solid #e53935',
                      bgcolor: 'rgba(229, 57, 53, 0.05)',
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                        <ReportProblem color="error" />
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                          Not Possible
                        </Typography>
                      </Stack>
                      <Typography variant="body1" color="text.secondary">
                        {quote.message ||
                          `Cannot exactly seat ${quote.group_size} people with available bundle sizes.`}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* Cinema Dialog */}
      <CinemaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreateCinema}
      />
    </Box>
  );
};
