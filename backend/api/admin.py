from django.contrib import admin

from .models import Cinema, Movie


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "release_year", "runtime", "watched", "created_at")
    list_filter = ("watched", "release_year")
    search_fields = ("title",)
    filter_horizontal = ("prerequisites",)


@admin.register(Cinema)
class CinemaAdmin(admin.ModelAdmin):
    list_display = ("name", "bundle_sizes", "created_at")
    search_fields = ("name",)
