import axios from 'axios';
import {
  BookingQuote,
  Cinema,
  CreateCinemaPayload,
  CreateMoviePayload,
  Movie,
  RewatchOrder,
  UpdateMoviePayload,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Movie API
export const getMovies = async (): Promise<Movie[]> => {
  const response = await api.get<Movie[]>('/movies/');
  return response.data;
};

export const createMovie = async (data: CreateMoviePayload): Promise<Movie> => {
  const response = await api.post<Movie>('/movies/', data);
  return response.data;
};

export const updateMovie = async (
  id: number,
  data: UpdateMoviePayload
): Promise<Movie> => {
  const response = await api.patch<Movie>(`/movies/${id}/`, data);
  return response.data;
};

export const getRewatchOrder = async (id: number): Promise<RewatchOrder> => {
  const response = await api.get<RewatchOrder>(`/movies/${id}/rewatch-order/`);
  return response.data;
};

// Cinema API
export const getCinemas = async (): Promise<Cinema[]> => {
  const response = await api.get<Cinema[]>('/cinemas/');
  return response.data;
};

export const createCinema = async (
  data: CreateCinemaPayload
): Promise<Cinema> => {
  const response = await api.post<Cinema>('/cinemas/', data);
  return response.data;
};

export const getBookingQuote = async (
  id: number,
  groupSize: number
): Promise<BookingQuote> => {
  const response = await api.get<BookingQuote>(
    `/cinemas/${id}/booking/?groupSize=${groupSize}`
  );
  return response.data;
};

export default api;
