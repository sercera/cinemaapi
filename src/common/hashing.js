const bcrypt = require('bcrypt');


async function hashString(string, salt = 10) {
  return bcrypt.hash(string, salt);
}

async function hashCheck(hashedString, plainString) {
  return bcrypt.compare(plainString, hashedString);
}

module.exports = {
  hashString,
  hashCheck,
};
