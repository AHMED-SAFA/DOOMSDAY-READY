"""
Management command to seed the database with example MCU movies and cinemas.

Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand

from api.models import Cinema, Movie


class Command(BaseCommand):
    help = "Seed the database with example MCU movies and sample cinemas."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Skip confirmation prompt.",
        )

    def handle(self, *args, **options):
        if Movie.objects.exists() or Cinema.objects.exists():
            self.stdout.write(
                self.style.WARNING("Database already has data. Skipping seed.")
            )
            return

        self.stdout.write("Seeding MCU movies...")

        # Create movies
        iron_man = Movie.objects.create(
            title="Iron Man", release_year=2008, runtime=126
        )
        cap_tfa = Movie.objects.create(
            title="Captain America: The First Avenger",
            release_year=2011,
            runtime=124,
        )
        avengers = Movie.objects.create(
            title="The Avengers", release_year=2012, runtime=143
        )
        civil_war = Movie.objects.create(
            title="Captain America: Civil War",
            release_year=2016,
            runtime=147,
        )
        ragnarok = Movie.objects.create(
            title="Thor: Ragnarok", release_year=2017, runtime=130
        )
        infinity_war = Movie.objects.create(
            title="Avengers: Infinity War",
            release_year=2018,
            runtime=149,
        )
        endgame = Movie.objects.create(
            title="Avengers: Endgame", release_year=2019, runtime=182
        )
        doomsday = Movie.objects.create(
            title="Avengers: Doomsday", release_year=2026, runtime=180
        )

        # Set prerequisites
        avengers.prerequisites.set([iron_man, cap_tfa])
        civil_war.prerequisites.set([avengers])
        infinity_war.prerequisites.set([civil_war, ragnarok])
        endgame.prerequisites.set([infinity_war])
        doomsday.prerequisites.set([endgame])

        self.stdout.write(self.style.SUCCESS(f"  Created {Movie.objects.count()} movies"))

        # Create sample cinemas
        self.stdout.write("Seeding cinemas...")

        Cinema.objects.create(
            name="IMAX Central", bundle_sizes=[1, 3, 4]
        )
        Cinema.objects.create(
            name="Starlight Multiplex", bundle_sizes=[2, 5]
        )
        Cinema.objects.create(
            name="Grand Arena", bundle_sizes=[6, 9, 20]
        )
        Cinema.objects.create(
            name="Cozy Corner Cinema", bundle_sizes=[4, 6]
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"  Created {Cinema.objects.count()} cinemas"
            )
        )
        self.stdout.write(self.style.SUCCESS("Seeding complete!"))
