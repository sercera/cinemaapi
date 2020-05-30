/* eslint-disable no-restricted-syntax */
const express = require('express');

const router = express.Router();


const { USER_ROLES } = require('../../constants/user_roles');

const { MovieRepository } = require('../../database/repositories');
const { asyncMiddleware, imageUploadMiddleware, roleAuthMiddleware } = require('../../middlewares');


router.post('/:movieId/like', asyncMiddleware(likeMovie));
router.put('/like', asyncMiddleware(likeMovies));

router.get('/', asyncMiddleware(getAllMovies));
router.get('/actors', asyncMiddleware(getAllMoviesWithActors));
router.get('/categories', asyncMiddleware(getMoviesByLikedCategories));
router.get('/recommended', asyncMiddleware(getRecomendedMovies));
router.get('/recommended/search/:searchTerm', asyncMiddleware(getRecomendedMoviesWithSearch));
router.get('/liked', asyncMiddleware(getLikedMovies));
router.post('/', roleAuthMiddleware(USER_ROLES.ADMIN), imageUploadMiddleware('imageUrl'), asyncMiddleware(createMovie));
router.put('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), imageUploadMiddleware('imageUrl'), asyncMiddleware(updateMovie));
router.get('/:id', asyncMiddleware(getMovieById));
router.delete('/:id', roleAuthMiddleware(USER_ROLES.ADMIN), asyncMiddleware(deleteMovie));
router.get('/categories/:categoryId', asyncMiddleware(getMoviesByCategory));


async function getAllMovies(req, res) {
  const movies = await MovieRepository.getPaginated(req.query);
  return res.json(movies);
}

async function getAllMoviesWithActors(req, res) {
  const movies = await MovieRepository.getAllWithActors(req.query);
  return res.json(movies);
}

async function getMoviesByCategory(req, res) {
  const { categoryId } = req.params;
  const movies = await MovieRepository.getByCategory(categoryId);
  return res.json(movies);
}

async function getMoviesByLikedCategories(req, res) {
  const { id: userId } = req.user;
  const movies = await MovieRepository.getByLikedCategories(userId);
  const allMovies = [];
  for (const movie of movies) {
    allMovies.push(movie.movie);
  }
  if (allMovies.length < 20) {
    const randomMovies = await MovieRepository.getAll({ limit: 20 });
    for (const movie of randomMovies) {
      if (allMovies.filter((e) => e.id === movie.id).length === 0 && allMovies.length < 20) {
        allMovies.push(movie);
      }
    }
  }
  return res.json(allMovies);
}

async function getLikedMovies(req, res) {
  const { id: userId } = req.user;
  const movies = await MovieRepository.getLikedMovies(userId);
  return res.json(movies);
}

async function getMovieById(req, res) {
  const { id } = req.params;
  const movie = await MovieRepository.getById(id);
  return res.json(movie);
}

async function createMovie(req, res) {
  const movie = await MovieRepository.create(req.body);
  return res.json(movie);
}

async function updateMovie(req, res) {
  const { id } = req.params;
  const updatedMovie = await MovieRepository.update(id, req.body);
  return res.json(updatedMovie);
}

async function deleteMovie(req, res) {
  const { id } = req.params;
  const response = await MovieRepository.deleteById(id);
  return res.json(response);
}

async function likeMovie(req, res) {
  const { body: { like }, params: { movieId }, user: { id: userId } } = req;
  if (like) {
    await MovieRepository.likeMovie(userId, movieId);
    return res.json({ message: 'Movie liked' });
  }
  await MovieRepository.dislikeMovie(userId, movieId);
  return res.json({ message: 'Movie disliked' });
}

async function likeMovies(req, res) {
  const { user: { id }, body: { movieIds } } = req;
  await MovieRepository.likeMovies(id, movieIds);
  return res.json({ message: 'Movies liked' });
}

async function getRecomendedMovies(req, res) {
  const { id } = req.user;
  const movies = await MovieRepository.getRecomended(id);
  const allMovies = [];
  for (const movie of movies) {
    allMovies.push(movie);
  }
  if (allMovies.length < 20) {
    const randomMovies = await MovieRepository.getAllStreamingMovies({ limit: 20 });
    for (const movie of randomMovies) {
      if (!allMovies.some((recMovies) => recMovies.id === movie.id) && allMovies.length < 20) {
        allMovies.push(movie);
      }
    }
  }
  return res.json(allMovies);
}

async function getRecomendedMoviesWithSearch(req, res) {
  const { id } = req.user;
  const { searchTerm } = req.params;
  const movies = await MovieRepository.getRecomendedWithSearch(id, searchTerm);
  const allMovies = [];
  for (const movie of movies) {
    allMovies.push(movie);
  }
  if (allMovies.length < 20) {
    const { data } = await MovieRepository.getPaginated({ searchTerm });
    for (const movie of data) {
      if (!allMovies.some((recMovies) => recMovies.id === movie.id) && allMovies.length < 20) {
        allMovies.push(movie);
      }
    }
  }
  return res.json(allMovies);
}


module.exports = router;
