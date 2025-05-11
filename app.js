

import express from 'express';
import path from 'path';
import Config from './src/config/config.js';
import { dbConnect } from './src/database/db.connector.js';

import authRoutes             from './src/routes/auth.js';
import userRoutes             from './src/routes/users.js';
import recipeRoutes           from './src/routes/recipes.js';
import tagRoutes              from './src/routes/tags.js';
import favRoutes              from './src/routes/favorites.js';
import commentRoutes          from './src/routes/comments.js';
import communityRoutes        from './src/routes/community.js';
import popularRecipesRoutes   from './src/routes/popularRecipes.js';
import ingredientSearchRoutes from './src/routes/ingredientSearch.js';
import recipeFilterRoutes     from './src/routes/recipeFilter.js';
import recipeCommentRoutes    from './src/routes/recipeComments.js';
import valoracionesRoutes     from './src/routes/valoraciones.js';
import recentRoutes           from './src/routes/recent.js';
import newsRoutes             from './src/routes/news.js';
import catRoutes              from './src/routes/categorias.js';
import filterRoutes           from './src/routes/filters.js';
import rLike from './src/routes/likes.js';

import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.originalUrl.includes('/user') || req.originalUrl.includes('/recipes/')) {
    console.log('RUTA SENSIBLE DETECTADA:', req.originalUrl);
    console.log('Referer:', req.headers.referer || 'No referer');
  }
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/recipes',     recipeRoutes);
app.use('/api/tags',        tagRoutes);
app.use('/api',             favRoutes);
app.use('/api',             commentRoutes);
app.use('/api/community',   communityRoutes);
app.use('/api/popular',     popularRecipesRoutes);
app.use('/api/ingredients', ingredientSearchRoutes);
app.use('/api/recipe-filters', recipeFilterRoutes);
app.use('/api',             recipeCommentRoutes);
app.use('/api',             valoracionesRoutes);
app.use('/api/recents',     recentRoutes);
app.use('/api/news',        newsRoutes);
app.use('/api/categorias',  catRoutes);
app.use('/api/filtros',     filterRoutes);
app.use('api', rLike);

app.use('/styles',  express.static(path.join(process.cwd(), 'public', 'styles')));
app.use('/scripts', express.static(path.join(process.cwd(), 'public', 'scripts')));

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'views', 'index.html'));
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'views', 'user.html'), err => {
    if (err) {
      res.redirect('/');
    }
  });
});

app.use(
  '/',
  express.static(path.join(process.cwd(), 'public', 'views'), {
    extensions: ['html']
  })
);

app.get('/:page', (req, res, next) => {
  if (req.params.page === 'api' || req.params.page.startsWith('api/')) {
    return next();
  }
  
  const file = path.join(
    process.cwd(),
    'public',
    'views',
    `${req.params.page}.html`
  );
  res.sendFile(file, err => {
    if (err) next();
  });
});

app.use(errorHandler);

dbConnect().then(() => {
  app.listen(Config.PORT, () =>
    console.log(`Servidor en http://${Config.SERVER}:${Config.PORT}`)
  );
});