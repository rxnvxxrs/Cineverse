(function () {
  const movies = window.CINEVERSE_MOVIES || (typeof CINEVERSE_MOVIES !== "undefined" ? CINEVERSE_MOVIES : []);
  const reviews = window.CINEVERSE_REVIEWS || (typeof CINEVERSE_REVIEWS !== "undefined" ? CINEVERSE_REVIEWS : []);
  const collections = window.CINEVERSE_COLLECTIONS || (typeof CINEVERSE_COLLECTIONS !== "undefined" ? CINEVERSE_COLLECTIONS : []);
  const posterBaseClass = "poster-card";
  const runtimeFallbacks = {
    interstellar: "169 min",
    dune: "155 min",
    oppenheimer: "180 min",
    obsession: "100 min",
    "spider-verse": "117 min",
    "avengers-endgame": "181 min",
    "la-la-land": "128 min",
    inception: "148 min",
    "the-batman": "176 min",
    "the-godfather": "175 min",
    casablanca: "102 min",
    parasite: "132 min",
    "mad-max-fury-road": "121 min",
    arrival: "116 min",
    "spirited-away": "125 min",
    "the-matrix": "136 min",
    whiplash: "107 min",
    "get-out": "104 min",
    "everything-everywhere": "140 min",
    "pulp-fiction": "154 min",
    "the-dark-knight": "152 min",
    "toy-story": "81 min"
  };
  const state = {
    query: "",
    collection: ""
  };

  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function $$(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function getMovie(id) {
    return movies.find((movie) => movie.id === id);
  }

  function getByCollection(name, limit) {
    const filtered = movies.filter((movie) => movie.collection.includes(name));
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }

  function getMovieByTitle(title) {
    return movies.find((movie) => movie.title === title);
  }

  function movieSearchText(movie) {
    return [
      movie.title,
      movie.year,
      movie.director,
      movie.genres.join(" "),
      movie.era,
      movie.tone,
      movie.collection.join(" ")
    ].join(" ").toLowerCase();
  }

  function getMovieRuntime(movie) {
    return movie.runtime || runtimeFallbacks[movie.id] || "Not listed";
  }

  function createPoster(movie, modifier = "") {
    const image = movie.poster
      ? `<img src="${movie.poster}" alt="${movie.title} poster" loading="lazy">`
      : `<div class="poster-fallback" aria-hidden="true">${movie.title}</div>`;

    return `
      <article class="${posterBaseClass} ${modifier}" role="button" tabindex="0" aria-label="View details for ${movie.title}" data-movie-card data-movie-id="${movie.id}" data-title="${movie.title.toLowerCase()}" data-genres="${movie.genres.join(" ").toLowerCase()}" data-year="${movie.year}" data-director="${movie.director.toLowerCase()}" data-collections="${movie.collection.join(" ").toLowerCase()}">
        <div class="poster-art">
          ${image}
          <span class="poster-rating">${movie.rating}</span>
        </div>
        <div class="poster-copy">
          <div>
            <h3>${movie.title}</h3>
            <p>${movie.year} · ${movie.genres.slice(0, 2).join(" / ")}</p>
          </div>
          <span>${movie.era}</span>
        </div>
      </article>
    `;
  }

  function renderMovieGrid(selector, items, modifier = "") {
    const container = $(selector);
    if (!container) return;
    container.innerHTML = items.map((movie) => createPoster(movie, modifier)).join("");
  }

  function renderDiscoveryCollections() {
    const container = $("[data-discovery-grid]");
    if (!container) return;

    container.innerHTML = collections.map((collection) => {
      const featured = collection.featuredIds
        .map((id) => getMovie(id))
        .filter(Boolean)
        .slice(0, 4);

      return `
        <a class="collection-card" href="movies.html?collection=${encodeURIComponent(collection.collection)}">
          <div class="collection-card__posters">
            ${featured.map((movie) => {
              if (movie.poster) {
                return `<img src="${movie.poster}" alt="${movie.title} poster" loading="lazy">`;
              }
              return `<span>${movie.title}</span>`;
            }).join("")}
          </div>
          <div>
            <p class="eyebrow">${collection.eyebrow}</p>
            <h3>${collection.title}</h3>
            <p>${collection.description}</p>
          </div>
        </a>
      `;
    }).join("");
  }

  function renderHeroCollage() {
    const container = $("[data-hero-collage]");
    if (!container) return;

    const heroMovies = getByCollection("Hero");
    container.innerHTML = heroMovies
      .map((movie, index) => {
        const image = movie.poster
          ? `<img src="${movie.poster}" alt="${movie.title} poster">`
          : `<div class="poster-fallback" aria-hidden="true">${movie.title}</div>`;
        return `
          <figure class="collage-poster collage-poster-${index + 1}">
            ${image}
            <figcaption>${movie.title}</figcaption>
          </figure>
        `;
      })
      .join("");
  }

  function renderGenres() {
    const container = $("[data-genre-grid]");
    if (!container) return;

    const genreMap = movies.reduce((map, movie) => {
      movie.genres.forEach((genre) => {
        if (!map[genre]) map[genre] = [];
        map[genre].push(movie);
      });
      return map;
    }, {});

    const preferred = ["Science Fiction", "Superhero", "Animation", "Drama", "Thriller", "Classics"];
    const cards = preferred.map((genre) => {
      const genreMovies = genre === "Classics"
        ? movies.filter((movie) => movie.collection.includes("Classics"))
        : genreMap[genre] || [];
      const sample = genreMovies.slice(0, 3);
      return `
        <article class="genre-card" data-genre="${genre}">
          <div class="genre-card__posters">
            ${sample.map((movie) => {
              if (movie.poster) {
                return `<img src="${movie.poster}" alt="${movie.title} poster" loading="lazy">`;
              }
              return `<span>${movie.title}</span>`;
            }).join("")}
          </div>
          <div>
            <p class="eyebrow">${sample.length} curated picks</p>
            <h3>${genre}</h3>
            <p>${describeGenre(genre)}</p>
          </div>
        </article>
      `;
    });

    container.innerHTML = cards.join("");
    container.querySelectorAll(".genre-card").forEach((card) => {
  card.style.cursor = "pointer";

  card.addEventListener("click", () => {
    const genre = card.dataset.genre;
    window.location.href = `movies.html?genre=${encodeURIComponent(genre)}`;
  });
});
  }

  function describeGenre(genre) {
    const descriptions = {
      "Science Fiction": "Big ideas, future worlds, and emotional scale.",
      Superhero: "Mythic heroes, moral pressure, and crowd-sized spectacle.",
      Animation: "Handcrafted worlds with wit, movement, and feeling.",
      Drama: "Character-led stories with emotional precision.",
      Thriller: "Tension, mystery, and cleanly executed suspense.",
      Classics: "Enduring films that still shape the language of cinema."
    };
    return descriptions[genre] || "Curated cinema selected for mood, craft, and discovery.";
  }

  function renderFeaturedMovie() {
    const container = $("[data-featured-movie]");
    if (!container) return;
    const movie = getMovie("arrival");
    container.innerHTML = `
      <div class="feature-poster">
        <img src="${movie.poster}" alt="${movie.title} poster" loading="lazy">
      </div>
      <div class="feature-copy">
        <p class="eyebrow">Featured Movie</p>
        <h2>${movie.title}</h2>
        <p>${movie.summary}</p>
        <dl class="feature-details">
          <div><dt>Year</dt><dd>${movie.year}</dd></div>
          <div><dt>Director</dt><dd>${movie.director}</dd></div>
          <div><dt>Rating</dt><dd>${movie.rating}</dd></div>
          <div><dt>Mood</dt><dd>${movie.tone}</dd></div>
        </dl>
        <a class="button button-primary" href="movies.html?search=${encodeURIComponent(movie.title)}">View Details</a>
      </div>
    `;
  }

  function renderReviews(selector = "[data-review-grid]") {
    const container = $(selector);
    if (!container) return;
    container.innerHTML = reviews.map((review) => `
      <article class="review-card">
        <div class="review-score">${review.score}</div>
        <blockquote>${review.quote}</blockquote>
        <p>${review.title}</p>
        <span>${review.reviewer}</span>
      </article>
    `).join("");
  }

  function renderMovieDetailLists() {
    renderMovieGrid("[data-trending-grid]", getByCollection("Trending", 6));
    renderMovieGrid("[data-editors-grid]", getByCollection("Editor's Picks", 6));
    renderMovieGrid("[data-movies-grid]", movies);
    renderMovieGrid("[data-related-grid]", [getMovie("the-godfather"), getMovie("spirited-away"), getMovie("mad-max-fury-road"), getMovie("parasite")].filter(Boolean));
  }

  function setupSearch() {
    const searchInputs = $$("[data-movie-search]");
    if (!searchInputs.length) return;

    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get("search") || "";
    const initialCollection = urlParams.get("collection") || "";
    state.query = initialSearch;
    state.collection = initialCollection;

    searchInputs.forEach((input) => {
      input.value = initialSearch;
      input.addEventListener("input", () => {
        state.query = input.value;
        filterMovies();
        renderSuggestions(input);
      });
      input.addEventListener("focus", () => renderSuggestions(input));
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          hideSuggestions(input);
        }
      });
    });

    renderFilterChips();
    filterMovies();
  }

  function filterMovies() {
    const cards = $$("[data-movie-card]");
    const empty = $("[data-empty-state]");
    if (!cards.length) return;

    const normalized = state.query.trim().toLowerCase();
    const activeCollection = state.collection.trim().toLowerCase();
    let count = 0;

    cards.forEach((card) => {
      const movie = getMovie(card.dataset.movieId);
      const haystack = movie ? movieSearchText(movie) : `${card.dataset.title} ${card.dataset.genres} ${card.dataset.year}`;
      const matchesText = !normalized || haystack.includes(normalized);
      const matchesCollection = !activeCollection || (movie && movie.collection.some((item) => item.toLowerCase() === activeCollection));
      const isMatch = matchesText && matchesCollection;
      card.hidden = !isMatch;
      if (isMatch) count += 1;
    });

    if (empty) empty.hidden = count !== 0;
    const resultLabel = $("[data-result-count]");
    if (resultLabel) {
      const collectionLabel = state.collection ? `${state.collection} · ` : "";
      resultLabel.textContent = normalized || state.collection ? `${collectionLabel}${count} result${count === 1 ? "" : "s"}` : `${cards.length} curated films`;
    }
  }

  function renderFilterChips() {
    const container = $("[data-filter-chips]");
    if (!container) return;

    const filters = [
      { label: "All", value: "" },
      ...collections.map((collection) => ({ label: collection.title, value: collection.collection })),
      { label: "International", value: "International Cinema" },
      { label: "Horror", value: "Horror" }
    ];

    container.innerHTML = filters.map((filter) => `
      <button class="filter-chip" type="button" data-filter-value="${filter.value}" aria-pressed="${state.collection === filter.value}">
        ${filter.label}
      </button>
    `).join("");

    $$(".filter-chip", container).forEach((chip) => {
      chip.addEventListener("click", () => {
        state.collection = chip.dataset.filterValue || "";
        $$(".filter-chip", container).forEach((item) => {
          item.setAttribute("aria-pressed", String(item === chip));
        });
        filterMovies();
      });
    });
  }

  function renderSuggestions(input) {
    const suggestions = $("[data-search-suggestions]", input.closest(".search-field") || document);
    if (!suggestions) return;

    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      hideSuggestions(input);
      return;
    }

    const matches = movies
      .filter((movie) => movieSearchText(movie).includes(query))
      .slice(0, 6);

    if (!matches.length) {
      hideSuggestions(input);
      return;
    }

    suggestions.hidden = false;
    suggestions.innerHTML = matches.map((movie) => `
      <button type="button" data-suggestion="${movie.title}">
        <span>${movie.title}</span>
        <small>${movie.year} · ${movie.genres.slice(0, 2).join(" / ")}</small>
      </button>
    `).join("");

    $$("button", suggestions).forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.suggestion;
        state.query = input.value;
        hideSuggestions(input);
        filterMovies();
        input.focus();
      });
    });
  }

  function hideSuggestions(input) {
    const suggestions = $("[data-search-suggestions]", input.closest(".search-field") || document);
    if (suggestions) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
    }
  }

  function setupHeaderSearch() {
    const form = $("[data-global-search]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("input", form);
      const query = input.value.trim();
      window.location.href = query ? `movies.html?search=${encodeURIComponent(query)}` : "movies.html";
    });
  }

  function setupNavigation() {
    const toggle = $("[data-nav-toggle]");
    const nav = $("#site-navigation");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        nav.classList.toggle("is-open", !isOpen);
      });
    }

    const current = document.body.dataset.page;
    $$("[data-nav-link]").forEach((link) => {
      if (link.dataset.navLink === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function setupMovieCards() {
    document.addEventListener("click", (event) => {
      const card = event.target.closest("[data-movie-card]");
      if (!card) return;
      openMovieModal(card.dataset.movieId);
    });

    document.addEventListener("keydown", (event) => {
      const card = event.target.closest("[data-movie-card]");
      if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openMovieModal(card.dataset.movieId);
      }

      if (event.key === "Escape") {
        closeMovieModal();
      }
    });
  }

  function ensureMovieModal() {
    let modal = $("[data-movie-modal]");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "movie-modal";
    modal.setAttribute("data-movie-modal", "");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="movie-modal__backdrop" data-close-modal></div>
      <article class="movie-modal__panel" tabindex="-1" data-modal-panel></article>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) {
        closeMovieModal();
      }
    });
    return modal;
  }

  function openMovieModal(movieId) {
    const movie = getMovie(movieId);
    if (!movie) return;

    const modal = ensureMovieModal();
    const panel = $("[data-modal-panel]", modal);
    const related = getRelatedMovies(movie).slice(0, 4);
    const image = movie.poster
      ? `<img src="${movie.poster}" alt="${movie.title} poster">`
      : `<div class="poster-fallback" aria-hidden="true">${movie.title}</div>`;

    panel.innerHTML = `
      <button class="modal-close" type="button" aria-label="Close movie details" data-close-modal>×</button>
      <div class="movie-modal__poster">${image}</div>
      <div class="movie-modal__copy">
        <p class="eyebrow">${movie.era}</p>
        <h2>${movie.title}</h2>
        <p>${movie.summary}</p>
        <dl class="modal-details">
          <div><dt>Year</dt><dd>${movie.year}</dd></div>
          <div><dt>Director</dt><dd>${movie.director}</dd></div>
          <div><dt>Genres</dt><dd>${movie.genres.join(" / ")}</dd></div>
          <div><dt>Rating</dt><dd>${movie.rating}</dd></div>
          <div><dt>Runtime</dt><dd>${getMovieRuntime(movie)}</dd></div>
          <div><dt>Mood</dt><dd>${movie.tone}</dd></div>
        </dl>
        <div class="modal-related">
          <h3>Related Recommendations</h3>
          <div>
            ${related.map((item) => `<button type="button" data-related-id="${item.id}">${item.title}</button>`).join("")}
          </div>
        </div>
      </div>
    `;

    $$("[data-related-id]", panel).forEach((button) => {
      button.addEventListener("click", () => openMovieModal(button.dataset.relatedId));
    });

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setupPosterFallbacks(panel);
    $("[data-modal-panel]", modal).focus();
  }

  function closeMovieModal() {
    const modal = $("[data-movie-modal]");
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function getRelatedMovies(movie) {
    const byGenre = movies.filter((candidate) => {
      return candidate.id !== movie.id && candidate.genres.some((genre) => movie.genres.includes(genre));
    });
    const byCollection = movies.filter((candidate) => {
      return candidate.id !== movie.id && candidate.collection.some((item) => movie.collection.includes(item));
    });
    return [...new Map([...byGenre, ...byCollection].map((item) => [item.id, item])).values()];
  }

  function setupRevealAnimations() {
    const items = $$(".reveal");
    if (!items.length) return;

    document.body.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      document.body.classList.remove("reveal-ready");
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        item.classList.add("is-visible");
        return;
      }
      observer.observe(item);
    });

    window.setTimeout(() => {
      items.forEach((item) => {
        if (!item.classList.contains("is-visible")) {
          item.classList.add("is-visible");
          observer.unobserve(item);
        }
      });
    }, 1200);
  }

  function setupContactForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const status = $("[data-form-status]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !message) {
        status.textContent = "Please complete all required fields.";
        status.className = "form-status is-error";
        return;
      }

      form.reset();
      status.textContent = "Thanks. Your message is ready for the CineVerse team.";
      status.className = "form-status is-success";
    });
  }

  function setupPosterFallbacks(scope = document) {
    $$("img", scope).forEach((image) => {
      if (image.dataset.fallbackReady) return;
      image.dataset.fallbackReady = "true";
      image.addEventListener("error", () => {
        const replacement = document.createElement("div");
        replacement.className = "poster-fallback";
        replacement.setAttribute("aria-hidden", "true");
        replacement.textContent = image.alt.replace(" poster", "");
        image.replaceWith(replacement);
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeroCollage();
    renderMovieDetailLists();
    renderDiscoveryCollections();
    renderGenres();
    renderFeaturedMovie();
    renderReviews();
    setupNavigation();
    setupHeaderSearch();
    setupSearch();
    setupMovieCards();
    setupRevealAnimations();
    setupContactForm();
    setupPosterFallbacks();
  });
})();
