const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const routes = require('./src/routes/index');

dotenv.config({ path: path.resolve('.env') });
const port = process.env.PORT || '3000';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);
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
  console.error(`error:${error.message}`);
  console.error(`token:${token}`);
  console.error(req.body);

  return res.json({
    message: error.message,
    error,
  });
});


app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
