export default class MoviePage {
  constructor() {
    this.eventHandler();
    this.read();
  }
  async read() {
    this.movies = await $.getJSON('/json/movies.json');
  }
  async render() {
    let genresToAdd = [];
    let ageRatingsToAdd = [];
    let allGenres = '';
    let ageRatings = '';
    let movieInfo = '';

    if (!this.movies) {
      await this.read();
    }
    this.gettingGenresFromJson(genresToAdd);
    genresToAdd.forEach((genre) => {
      allGenres += /*html*/ ` <option value="${genre}">${genre}</option> `;
    });
    this.gettingAgeRatingFromJson(ageRatingsToAdd);
    ageRatingsToAdd.forEach((age) => {
      ageRatings += /*html*/ `<option value="${age}">${age}</option>`;
    });
    this.movies.forEach((data) => {
      movieInfo += this.addingMovieInfoToHtml(data);
    });

    return `
    <div class="movie-container"><div class="headline"></div>
      <h1>Aktuellt på Bio</h1>
      <div class="movie-filter">
        <select id="category-filter">
          <option value="default">Genre</option>
          ${allGenres}
        </select>
        <select id="age-filter">
          <option value="default">Åldersgrupp</option>
          ${ageRatings}
        </select>
      </div>
      <div class="movies-main-box">
          ${movieInfo}
    </div></div>
    `;
  }

  reRenderMovies(category, age) {
    let movieInfo = '';
    let filteredMovies = [];

    this.filteringMovies(age, category, filteredMovies);

    filteredMovies.forEach((data) => {
      movieInfo += this.addingMovieInfoToHtml(data);
    });

    movieInfo += '</div></div>';
    $('.movies-main-box').html(' ');
    $('.movies-main-box').append(movieInfo);
  }

  filteringMovies(age, category, filteredMovies) {
    this.movies.forEach((movie) => {
      let movieAge = '';
      isNaN(parseFloat(movie.ageRating))
        ? (movieAge = movie.ageRating)
        : (movieAge = parseInt(movie.ageRating));
      if (movieAge === 'barntillåten' || age === 'default') {
        if (movie.genre.includes(category) || category === 'default') {
          filteredMovies.push(movie);
        }
      } else if (
        (movieAge <= age && movie.genre.includes(category)) ||
        (movieAge <= age && category === 'default')
      ) {
        filteredMovies.push(movie);
      }
    });
  }

  gettingGenresFromJson(allGenres) {
    this.movies.forEach((movie) => {
      movie.genre.forEach((data) => {
        if (!allGenres.includes(data)) {
          allGenres.push(data);
        }
      });
    });
  }

  gettingAgeRatingFromJson(ageRating) {
    this.movies.forEach((movie) => {
      if (!ageRating.includes(movie.ageRating)) {
        ageRating.push(movie.ageRating);
      }
    });
    ageRating.sort((a, b) => a - b);
  }

  addingMovieInfoToHtml(data) {
    let genreString = data.genre.join(', ');
    return `<section class="movie-info">
          <div class="movie-poster">
            <a href="#aboutPage/${data.id}"><img src="${data.images[0]}"></a>
          </div>
          <div class="movie-text">
            <h2 class="title-name">${data.title}</h2>
            <p>Genre:</p><p> ${genreString}</p>
            <p>Speltid:</p><p> ${data.length + ' minuter'}</p>
            <p>Handling:&nbsp;</p>
            ${data.description}
          </div>
        </section><hr class="seperator">`;
  }

  eventHandler() {
    $('body').on('change', '.movie-filter', () => {
      this.reRenderMovies($('#category-filter').val(), $('#age-filter').val());
      this.disableAgeSelector();
      this.disableCategorySelector();
    });
  }

  disableAgeSelector() {
    $('#age-filter > option').each(function () {
      $(this).prop('disabled', false);
    });
    let categoryChoice = $('#category-filter').val();
    let genreAge = [];
    this.movies.forEach((movie) => {
      if (movie.genre.includes(categoryChoice)) {
        if (!genreAge.includes(movie.ageRating)) {
          genreAge.push(movie.ageRating);
        }
      }
    });
    genreAge.sort((a, b) => a - b);
    $('#age-filter > option').each(function () {
      if (this.value < genreAge[0]) {
        $(this).prop('disabled', true);
      } else if (
        !genreAge.includes('barntillåten') &&
        this.value === 'barntillåten' &&
        genreAge.length !== 0
      ) {
        $(this).prop('disabled', true);
      }
    });
  }
  disableCategorySelector() {
    $('#category-filter > option').each(function () {
      $(this).prop('disabled', false);
    });
    let ageChoice = $('#age-filter').val();
    let ageCategory = [];
    this.movies.forEach((movie) => {
      if (ageChoice === 'barntillåten') {
        ageChoice = 1;
      }
      if (movie.ageRating <= ageChoice || isNaN(parseFloat(movie.ageRating))) {
        movie.genre.forEach((data) => {
          if (!ageCategory.includes(data)) {
            ageCategory.push(data);
          }
        });
      }
    });
    $('#category-filter > option').each(function () {
      if (!ageCategory.includes(this.value)) {
        if (this.value !== 'default') {
          $(this).prop('disabled', true);
        }
      }
    });
  }
}
