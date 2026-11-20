export interface PrerequisiteDetail {
  id: number;
  title: string;
}

export interface Movie {
  id: number;
  title: string;
  release_year: number;
  runtime: number;
  watched: boolean;
  prerequisites: number[];
  prerequisite_details: PrerequisiteDetail[];
  created_at: string;
  updated_at: string;
}

export interface CreateMoviePayload {
  title: string;
  release_year: number;
  runtime: number;
  watched?: boolean;
  prerequisites?: number[];
}

export interface UpdateMoviePayload {
  title?: string;
  release_year?: number;
  runtime?: number;
  watched?: boolean;
  prerequisites?: number[];
}

export interface RewatchOrder {
  movies: Movie[];
  watched_count: number;
  total_count: number;
  total_unwatched_runtime: number;
}

export interface Cinema {
  id: number;
  name: string;
  bundle_sizes: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateCinemaPayload {
  name: string;
  bundle_sizes: number[];
}

export interface BookingQuote {
  group_size: number;
  possible: boolean;
  total_bundles: number | null;
  bundles: Record<string, number> | null;
  message: string | null;
}
