const dotenv = require('dotenv');
const fs = require('fs');


function initializeEnvironment() {
  dotenv.config();
  if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    Object.keys(envConfig).forEach((key) => {
      process.env[key] = envConfig[key];
    });
  }
}

module.exports = {
  initializeEnvironment,
};
