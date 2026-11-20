"""
Data models for Doomsday Ready.

Movie: Represents an MCU movie with prerequisites (dependency graph).
Cinema: Represents a cinema with bundle sizes for group booking.
"""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Movie(models.Model):
    """
    Represents an MCU movie in the rewatch planner.

    Prerequisites form a directed acyclic graph (DAG) — a movie lists
    other movies that should be watched before it. Circular dependencies
    are prevented at the application layer via DFS cycle detection.
    """

    title = models.CharField(max_length=200, unique=True)
    release_year = models.IntegerField()
    runtime = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(300)],
        help_text="Runtime in minutes (1–300)",
    )
    prerequisites = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="required_by",
    )
    watched = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["release_year", "title"]

    def __str__(self):
        return f"{self.title} ({self.release_year})"


class Cinema(models.Model):
    """
    Represents a cinema that sells opening-night seats in fixed bundles.

    bundle_sizes is a JSON list of integers (1–10 items, each 1–500).
    Example: [2, 5] means seats are sold only in bundles of 2 or 5.
    """

    name = models.CharField(max_length=200, unique=True)
    bundle_sizes = models.JSONField(
        help_text="List of seat bundle sizes (1–10 items, each 1–500)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
