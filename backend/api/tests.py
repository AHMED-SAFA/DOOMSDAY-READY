"""
Tests for the Doomsday Ready API.

Covers:
  - Movie CRUD and circular dependency detection
  - Rewatch order (topological sort)
  - Cinema CRUD and booking quotes
"""

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Cinema, Movie
from .services import detect_circular_dependency, get_booking_quote, get_rewatch_order


class MovieModelTest(TestCase):
    """Tests for the Movie model."""

    def test_create_movie(self):
        movie = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        self.assertEqual(str(movie), "Iron Man (2008)")
        self.assertFalse(movie.watched)


class CircularDependencyTest(TestCase):
    """Tests for circular dependency detection."""

    def setUp(self):
        self.iron_man = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        self.cap = Movie.objects.create(
            title="Captain America: TFA", release_year=2011, runtime=124
        )
        self.avengers = Movie.objects.create(
            title="The Avengers", release_year=2012, runtime=143
        )
        self.avengers.prerequisites.set([self.iron_man, self.cap])

    def test_no_cycle(self):
        """Adding a valid prerequisite should not detect a cycle."""
        result = detect_circular_dependency(
            self.avengers.id, [self.iron_man.id, self.cap.id]
        )
        self.assertFalse(result)

    def test_self_dependency(self):
        """A movie cannot be its own prerequisite."""
        result = detect_circular_dependency(
            self.iron_man.id, [self.iron_man.id]
        )
        self.assertTrue(result)

    def test_circular_dependency(self):
        """Creating a cycle should be detected."""
        # iron_man -> avengers would create: avengers depends on iron_man,
        # and iron_man would depend on avengers
        result = detect_circular_dependency(
            self.iron_man.id, [self.avengers.id]
        )
        self.assertTrue(result)


class RewatchOrderTest(TestCase):
    """Tests for the rewatch order (topological sort)."""

    def setUp(self):
        self.iron_man = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        self.cap = Movie.objects.create(
            title="Captain America: TFA", release_year=2011, runtime=124
        )
        self.avengers = Movie.objects.create(
            title="The Avengers", release_year=2012, runtime=143
        )
        self.civil_war = Movie.objects.create(
            title="Captain America: Civil War", release_year=2016, runtime=147
        )
        self.ragnarok = Movie.objects.create(
            title="Thor: Ragnarok", release_year=2017, runtime=130
        )
        self.infinity_war = Movie.objects.create(
            title="Avengers: Infinity War", release_year=2018, runtime=149
        )
        self.endgame = Movie.objects.create(
            title="Avengers: Endgame", release_year=2019, runtime=182
        )
        self.doomsday = Movie.objects.create(
            title="Avengers: Doomsday", release_year=2026, runtime=180
        )

        # Set prerequisites
        self.avengers.prerequisites.set([self.iron_man, self.cap])
        self.civil_war.prerequisites.set([self.avengers])
        self.infinity_war.prerequisites.set([self.civil_war, self.ragnarok])
        self.endgame.prerequisites.set([self.infinity_war])
        self.doomsday.prerequisites.set([self.endgame])

    def test_rewatch_doomsday(self):
        """Rewatch order for Doomsday should include all 7 other movies."""
        result = get_rewatch_order(self.doomsday.id)
        self.assertEqual(result["total_count"], 7)

    def test_rewatch_civil_war(self):
        """Rewatch order for Civil War: Iron Man, Cap, Avengers."""
        result = get_rewatch_order(self.civil_war.id)
        self.assertEqual(result["total_count"], 3)
        titles = [m.title for m in result["movies"]]
        # Avengers must come after Iron Man and Cap
        self.assertGreater(
            titles.index("The Avengers"),
            titles.index("Iron Man"),
        )

    def test_rewatch_ragnarok(self):
        """Ragnarok has no prerequisites — empty list."""
        result = get_rewatch_order(self.ragnarok.id)
        self.assertEqual(result["total_count"], 0)
        self.assertEqual(result["movies"], [])


class BookingQuoteTest(TestCase):
    """Tests for the booking quote algorithm."""

    def test_exact_match(self):
        """Bundle [1,3,4], group 6 → 2 bundles (3×2)."""
        result = get_booking_quote([1, 3, 4], 6)
        self.assertTrue(result["possible"])
        self.assertEqual(result["total_bundles"], 2)

    def test_mixed_bundles(self):
        """Bundle [2,5], group 11 → 4 bundles (5×1, 2×3)."""
        result = get_booking_quote([2, 5], 11)
        self.assertTrue(result["possible"])
        self.assertEqual(result["total_bundles"], 4)

    def test_larger_bundles(self):
        """Bundle [6,9,20], group 44 → 4 bundles."""
        result = get_booking_quote([6, 9, 20], 44)
        self.assertTrue(result["possible"])
        self.assertEqual(result["total_bundles"], 4)

    def test_not_possible(self):
        """Bundle [4,6], group 7 → not possible."""
        result = get_booking_quote([4, 6], 7)
        self.assertFalse(result["possible"])


class APIEndpointTest(TestCase):
    """Integration tests for the REST API endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_create_movie(self):
        response = self.client.post(
            "/api/movies/",
            {"title": "Iron Man", "release_year": 2008, "runtime": 126},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["title"], "Iron Man")

    def test_list_movies(self):
        Movie.objects.create(title="Iron Man", release_year=2008, runtime=126)
        response = self.client.get("/api/movies/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_update_movie_watched(self):
        movie = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        response = self.client.patch(
            f"/api/movies/{movie.id}/",
            {"watched": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["watched"])

    def test_circular_dependency_409(self):
        """PATCH that creates a cycle returns 409."""
        iron_man = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        avengers = Movie.objects.create(
            title="The Avengers", release_year=2012, runtime=143
        )
        avengers.prerequisites.set([iron_man])

        response = self.client.patch(
            f"/api/movies/{iron_man.id}/",
            {"prerequisites": [avengers.id]},
            format="json",
        )
        self.assertEqual(response.status_code, 409)

    def test_create_cinema(self):
        response = self.client.post(
            "/api/cinemas/",
            {"name": "IMAX Central", "bundle_sizes": [2, 5]},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_booking_quote(self):
        cinema = Cinema.objects.create(
            name="IMAX Central", bundle_sizes=[2, 5]
        )
        response = self.client.get(
            f"/api/cinemas/{cinema.id}/booking/?groupSize=11"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["possible"])
