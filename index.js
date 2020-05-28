const express = require('express');
const cors = require('cors');

const { initializeEnvironment } = require('./src/common/environment');

initializeEnvironment();

const routes = require('./src/routes/index');

const port = process.env.PORT || '3000';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.use('/api', routes);


// Error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const { body: { token } = {} } = req;
  if (error.statusCode) {
    console.error(`path:${req.path}`);
    console.error(`error:${error.message}`);
    console.error(`token:${token}`);
    console.error(req.body);
    return res.status(error.statusCode).json({
      error,
    });
  }
  console.error(`path:${req.path}`);
  console.error(`method:${req.method}`);
  console.error(`error:${error.message}`);
  console.error(req.body);

  return res.json({
    message: error.message,
    error,
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
