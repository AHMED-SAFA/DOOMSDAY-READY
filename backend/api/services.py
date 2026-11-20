"""
Core business logic for Doomsday Ready.

Contains hand-written algorithms (no external solver libraries):
  1. Circular dependency detection (DFS)
  2. Topological sort for rewatch order (Kahn's algorithm)
  3. Minimum bundle booking (dynamic programming)
"""

from collections import deque

from .models import Movie


# ---------------------------------------------------------------------------
# Feature 1: Circular Dependency Detection (DFS)
# ---------------------------------------------------------------------------

def detect_circular_dependency(movie_id: int, new_prerequisite_ids: list[int]) -> bool:
    """
    Check whether adding `new_prerequisite_ids` as prerequisites of
    `movie_id` would create a cycle in the dependency graph.

    Algorithm:
      For each proposed prerequisite P, run a DFS starting from P,
      following the *existing* prerequisite edges. If we can reach
      `movie_id` from P, then adding P as a prerequisite of `movie_id`
      would create a cycle.

    Also rejects a movie depending on itself directly.

    Returns True if a cycle would be created, False otherwise.
    """
    # A movie cannot be its own prerequisite
    if movie_id in new_prerequisite_ids:
        return True

    # Build the adjacency list from the database (movie -> its prerequisites)
    # We need to check: can we reach `movie_id` by following prerequisites
    # starting from any of the new_prerequisite_ids?
    all_movies = Movie.objects.prefetch_related("prerequisites").all()
    graph: dict[int, list[int]] = {}
    for movie in all_movies:
        graph[movie.id] = [p.id for p in movie.prerequisites.all()]

    # Temporarily add the new edges: movie_id -> new_prerequisite_ids
    # We need to check if following prerequisites from any new_prerequisite_id
    # can reach movie_id (which would form a cycle).
    # The graph stores: node -> [prerequisites of node]
    # If movie_id has prerequisites new_prerequisite_ids, and from any of those
    # we can reach movie_id via existing edges, there's a cycle.

    # Update graph with proposed change
    graph[movie_id] = new_prerequisite_ids

    # DFS cycle detection from movie_id
    visited: set[int] = set()

    def has_cycle(node: int, path: set[int]) -> bool:
        """DFS: returns True if a cycle is detected."""
        if node in path:
            return True
        if node in visited:
            return False

        path.add(node)
        for neighbor in graph.get(node, []):
            if has_cycle(neighbor, path):
                return True
        path.remove(node)
        visited.add(node)
        return False

    return has_cycle(movie_id, set())


# ---------------------------------------------------------------------------
# Feature 1: Topological Sort — Rewatch Order (Kahn's Algorithm)
# ---------------------------------------------------------------------------

def get_rewatch_order(movie_id: int) -> dict:
    """
    Given a target movie, return all transitive prerequisites in
    topological order (every movie appears after its own prerequisites).

    Uses Kahn's algorithm (BFS-based topological sort).

    Returns a dict:
      {
        "movies": [Movie, ...],  # ordered list (QuerySet-like)
        "watched_count": int,
        "total_count": int,
        "total_unwatched_runtime": int,
      }
    """
    target = Movie.objects.prefetch_related("prerequisites").get(id=movie_id)

    # Step 1: Collect all transitive prerequisites via BFS
    all_prereq_ids: set[int] = set()
    queue: deque[int] = deque()

    # Start from the target's direct prerequisites
    for prereq in target.prerequisites.all():
        queue.append(prereq.id)
        all_prereq_ids.add(prereq.id)

    # Fetch all movies with their prerequisites for graph traversal
    movies_map: dict[int, Movie] = {}
    for movie in Movie.objects.prefetch_related("prerequisites").all():
        movies_map[movie.id] = movie

    # BFS to find all transitive prerequisites
    while queue:
        current_id = queue.popleft()
        current_movie = movies_map.get(current_id)
        if current_movie:
            for prereq in current_movie.prerequisites.all():
                if prereq.id not in all_prereq_ids:
                    all_prereq_ids.add(prereq.id)
                    queue.append(prereq.id)

    if not all_prereq_ids:
        return {
            "movies": [],
            "watched_count": 0,
            "total_count": 0,
            "total_unwatched_runtime": 0,
        }

    # Step 2: Build a subgraph of only the prerequisite movies
    # Graph: movie_id -> set of prerequisite_ids (only within our subset)
    subgraph: dict[int, set[int]] = {}
    in_degree: dict[int, int] = {}

    for mid in all_prereq_ids:
        subgraph[mid] = set()
        in_degree[mid] = 0

    for mid in all_prereq_ids:
        movie = movies_map[mid]
        for prereq in movie.prerequisites.all():
            if prereq.id in all_prereq_ids:
                subgraph[mid].add(prereq.id)
                # prereq must come before mid, so in Kahn's: mid depends on prereq
                # We're building: "mid has edge FROM prereq" => in_degree[mid] += 1

    # Recompute in-degree: for each movie, count how many movies in the subset
    # list it as a prerequisite (i.e., how many movies must come before it)
    # Actually, let's think about this more carefully:
    # Edge semantics: if movie A has prerequisite B, then B must come before A.
    # In Kahn's, we want to process nodes with in_degree 0 first.
    # in_degree[A] = number of prerequisites A has (within the subset).

    for mid in all_prereq_ids:
        in_degree[mid] = len(subgraph[mid])

    # Step 3: Kahn's algorithm
    sorted_order: list[int] = []
    kahn_queue: deque[int] = deque()

    for mid in all_prereq_ids:
        if in_degree[mid] == 0:
            kahn_queue.append(mid)

    while kahn_queue:
        node = kahn_queue.popleft()
        sorted_order.append(node)

        # For every movie that depends on `node`, decrement its in_degree
        for mid in all_prereq_ids:
            if node in subgraph[mid]:
                in_degree[mid] -= 1
                if in_degree[mid] == 0:
                    kahn_queue.append(mid)

    # Step 4: Build the result
    ordered_movies = [movies_map[mid] for mid in sorted_order]

    watched_count = sum(1 for m in ordered_movies if m.watched)
    total_count = len(ordered_movies)
    total_unwatched_runtime = sum(
        m.runtime for m in ordered_movies if not m.watched
    )

    return {
        "movies": ordered_movies,
        "watched_count": watched_count,
        "total_count": total_count,
        "total_unwatched_runtime": total_unwatched_runtime,
    }


# ---------------------------------------------------------------------------
# Feature 2: Minimum Bundle Booking (Dynamic Programming)
# ---------------------------------------------------------------------------

def get_booking_quote(bundle_sizes: list[int], group_size: int) -> dict:
    """
    Find the fewest bundles whose seats add up to exactly `group_size`.

    Uses bottom-up dynamic programming (similar to the coin change problem).

    dp[i] = minimum number of bundles to exactly fill i seats
    parent[i] = the bundle size used to reach dp[i] (for reconstruction)

    Returns a dict:
      {
        "group_size": int,
        "possible": bool,
        "total_bundles": int | None,
        "bundles": dict[str, int] | None,  # e.g. {"5": 1, "2": 3}
        "message": str | None,
      }
    """
    INF = float("inf")

    # dp[i] = minimum bundles to exactly seat i people
    dp = [INF] * (group_size + 1)
    dp[0] = 0

    # parent[i] = which bundle size was used to reach dp[i]
    parent = [-1] * (group_size + 1)

    for i in range(1, group_size + 1):
        for size in bundle_sizes:
            if size <= i and dp[i - size] + 1 < dp[i]:
                dp[i] = dp[i - size] + 1
                parent[i] = size

    if dp[group_size] == INF:
        return {
            "group_size": group_size,
            "possible": False,
            "total_bundles": None,
            "bundles": None,
            "message": (
                f"Cannot exactly seat {group_size} people with "
                f"available bundle sizes {sorted(bundle_sizes)}"
            ),
        }

    # Reconstruct which bundles to buy
    bundles: dict[str, int] = {}
    remaining = group_size
    while remaining > 0:
        size = parent[remaining]
        key = str(size)
        bundles[key] = bundles.get(key, 0) + 1
        remaining -= size

    return {
        "group_size": group_size,
        "possible": True,
        "total_bundles": dp[group_size],
        "bundles": bundles,
        "message": None,
    }
