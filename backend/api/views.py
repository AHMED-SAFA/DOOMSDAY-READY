"""
API views for Doomsday Ready.

Implements RESTful endpoints for Movies and Cinemas with
proper error handling and HTTP status codes.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cinema, Movie
from .serializers import (
    BookingQuoteSerializer,
    CinemaSerializer,
    MovieCreateSerializer,
    MovieSerializer,
    RewatchOrderSerializer,
)
from .services import get_booking_quote, get_rewatch_order


def _is_circular_dependency_error(exc) -> bool:
    """
    Check if a DRF ValidationError contains a CIRCULAR_DEPENDENCY error.
    DRF wraps errors in various structures (dicts, lists, ErrorDetail objects),
    so we need to check recursively.
    """
    if not hasattr(exc, "detail"):
        return False
    return "CIRCULAR_DEPENDENCY" in str(exc.detail)


# ---------------------------------------------------------------------------
# Movie Views
# ---------------------------------------------------------------------------


class MovieListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/movies/     → List all movies
    POST /api/movies/     → Create a new movie
    """

    queryset = Movie.objects.prefetch_related("prerequisites").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MovieCreateSerializer
        return MovieSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            if _is_circular_dependency_error(e):
                return Response(
                    {"error": "CIRCULAR_DEPENDENCY"},
                    status=status.HTTP_409_CONFLICT,
                )
            raise

        try:
            self.perform_create(serializer)
        except Exception as e:
            if "CIRCULAR_DEPENDENCY" in str(e):
                return Response(
                    {"error": "CIRCULAR_DEPENDENCY"},
                    status=status.HTTP_409_CONFLICT,
                )
            raise

        # Re-serialize with the full MovieSerializer to include prerequisite_details
        movie = Movie.objects.prefetch_related("prerequisites").get(id=serializer.instance.id)
        output_serializer = MovieSerializer(movie)
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class MovieDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/movies/:id/  → Retrieve a movie
    PATCH /api/movies/:id/  → Update a movie (title, watched, prerequisites, etc.)
    """

    queryset = Movie.objects.prefetch_related("prerequisites").all()
    serializer_class = MovieSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            if _is_circular_dependency_error(e):
                return Response(
                    {"error": "CIRCULAR_DEPENDENCY"},
                    status=status.HTTP_409_CONFLICT,
                )
            raise

        self.perform_update(serializer)

        # Re-fetch to get updated prerequisite_details
        instance.refresh_from_db()
        instance = Movie.objects.prefetch_related("prerequisites").get(id=instance.id)
        output_serializer = MovieSerializer(instance)
        return Response(output_serializer.data)


class RewatchOrderView(APIView):
    """
    GET /api/movies/:id/rewatch-order/

    Returns the topologically sorted list of all transitive prerequisites
    for the given movie, along with watch progress statistics.
    """

    def get(self, request, pk):
        try:
            Movie.objects.get(id=pk)
        except Movie.DoesNotExist:
            return Response(
                {"error": "Movie not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = get_rewatch_order(pk)

        # Serialize the movies properly
        movie_serializer = MovieSerializer(result["movies"], many=True)
        response_data = {
            "movies": movie_serializer.data,
            "watched_count": result["watched_count"],
            "total_count": result["total_count"],
            "total_unwatched_runtime": result["total_unwatched_runtime"],
        }

        return Response(response_data)


# ---------------------------------------------------------------------------
# Cinema Views
# ---------------------------------------------------------------------------


class CinemaListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/cinemas/     → List all cinemas
    POST /api/cinemas/     → Create a new cinema
    """

    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer


class CinemaDetailView(generics.RetrieveAPIView):
    """
    GET /api/cinemas/:id/ → Retrieve a cinema
    """

    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer


class BookingQuoteView(APIView):
    """
    GET /api/cinemas/:id/booking/?groupSize=N

    Returns the minimum number of seat bundles to exactly fill
    the requested group size, or indicates it's not possible.
    """

    def get(self, request, pk):
        try:
            cinema = Cinema.objects.get(id=pk)
        except Cinema.DoesNotExist:
            return Response(
                {"error": "Cinema not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        group_size = request.query_params.get("groupSize")
        if group_size is None:
            return Response(
                {"error": "groupSize query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            group_size = int(group_size)
        except (ValueError, TypeError):
            return Response(
                {"error": "groupSize must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if group_size < 1 or group_size > 10000:
            return Response(
                {"error": "groupSize must be between 1 and 10,000"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = get_booking_quote(cinema.bundle_sizes, group_size)
        serializer = BookingQuoteSerializer(result)
        return Response(serializer.data)
