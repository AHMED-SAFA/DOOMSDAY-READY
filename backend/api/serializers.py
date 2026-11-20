"""
Serializers for the Doomsday Ready API.

Handles validation for Movie and Cinema models, including
circular dependency checks for movie prerequisites.
"""

from rest_framework import serializers

from .models import Cinema, Movie
from .services import detect_circular_dependency


class PrerequisiteDetailSerializer(serializers.ModelSerializer):
    """Minimal serializer for prerequisite movie references."""

    class Meta:
        model = Movie
        fields = ["id", "title"]


class MovieSerializer(serializers.ModelSerializer):
    """
    Full serializer for Movie model.

    - `prerequisites`: list of movie IDs (write)
    - `prerequisite_details`: nested objects with id+title (read-only)
    """

    prerequisite_details = PrerequisiteDetailSerializer(
        source="prerequisites", many=True, read_only=True
    )
    prerequisites = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Movie.objects.all(), required=False
    )

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "release_year",
            "runtime",
            "watched",
            "prerequisites",
            "prerequisite_details",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_runtime(self, value):
        """Ensure runtime is between 1 and 300 minutes."""
        if value < 1 or value > 300:
            raise serializers.ValidationError(
                "Runtime must be between 1 and 300 minutes."
            )
        return value

    def validate(self, attrs):
        """
        Check for circular dependencies when prerequisites are being set.
        """
        prerequisites = attrs.get("prerequisites")
        if prerequisites is not None:
            prerequisite_ids = [p.id for p in prerequisites]

            # Determine the movie ID (existing movie on update, or None on create)
            movie_id = self.instance.id if self.instance else None

            if movie_id is not None:
                if detect_circular_dependency(movie_id, prerequisite_ids):
                    raise serializers.ValidationError(
                        detail={"error": "CIRCULAR_DEPENDENCY"},
                        code="circular_dependency",
                    )

        return attrs


class MovieCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for creating movies.
    Handles prerequisite validation at creation time.
    """

    prerequisites = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Movie.objects.all(), required=False
    )

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "release_year",
            "runtime",
            "watched",
            "prerequisites",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_runtime(self, value):
        if value < 1 or value > 300:
            raise serializers.ValidationError(
                "Runtime must be between 1 and 300 minutes."
            )
        return value

    def create(self, validated_data):
        prerequisites = validated_data.pop("prerequisites", [])
        movie = Movie.objects.create(**validated_data)

        if prerequisites:
            prerequisite_ids = [p.id for p in prerequisites]
            # Check circular dependency after creating
            if detect_circular_dependency(movie.id, prerequisite_ids):
                movie.delete()
                raise serializers.ValidationError(
                    detail={"error": "CIRCULAR_DEPENDENCY"},
                    code="circular_dependency",
                )
            movie.prerequisites.set(prerequisites)

        return movie


class CinemaSerializer(serializers.ModelSerializer):
    """Serializer for Cinema model with bundle_sizes validation."""

    class Meta:
        model = Cinema
        fields = [
            "id",
            "name",
            "bundle_sizes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_bundle_sizes(self, value):
        """Validate bundle_sizes: 1–10 items, each between 1 and 500."""
        if not isinstance(value, list):
            raise serializers.ValidationError("bundle_sizes must be a list.")
        if len(value) < 1 or len(value) > 10:
            raise serializers.ValidationError(
                "bundle_sizes must contain between 1 and 10 items."
            )
        for size in value:
            if not isinstance(size, int) or size < 1 or size > 500:
                raise serializers.ValidationError(
                    f"Each bundle size must be an integer between 1 and 500. Got: {size}"
                )
        return value


class BookingQuoteSerializer(serializers.Serializer):
    """Read-only serializer for booking quote responses."""

    group_size = serializers.IntegerField()
    possible = serializers.BooleanField()
    total_bundles = serializers.IntegerField(allow_null=True)
    bundles = serializers.DictField(
        child=serializers.IntegerField(), allow_null=True
    )
    message = serializers.CharField(allow_null=True)


class RewatchOrderSerializer(serializers.Serializer):
    """Read-only serializer for rewatch order responses."""

    movies = MovieSerializer(many=True)
    watched_count = serializers.IntegerField()
    total_count = serializers.IntegerField()
    total_unwatched_runtime = serializers.IntegerField()
