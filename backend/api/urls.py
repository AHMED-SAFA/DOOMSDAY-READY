"""URL patterns for the Doomsday Ready API."""

from django.urls import path

from .views import (
    BookingQuoteView,
    CinemaDetailView,
    CinemaListCreateView,
    MovieDetailView,
    MovieListCreateView,
    RewatchOrderView,
)

urlpatterns = [
    # Movies
    path("movies/", MovieListCreateView.as_view(), name="movie-list-create"),
    path("movies/<int:pk>/", MovieDetailView.as_view(), name="movie-detail"),
    path(
        "movies/<int:pk>/rewatch-order/",
        RewatchOrderView.as_view(),
        name="rewatch-order",
    ),
    # Cinemas
    path("cinemas/", CinemaListCreateView.as_view(), name="cinema-list-create"),
    path("cinemas/<int:pk>/", CinemaDetailView.as_view(), name="cinema-detail"),
    path(
        "cinemas/<int:pk>/booking/",
        BookingQuoteView.as_view(),
        name="booking-quote",
    ),
]
