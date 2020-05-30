const { initializeEnvironment } = require('../../common/environment');

initializeEnvironment();

const { USER_ROLES } = require('../../constants/user_roles');

const { UserRepository } = require('../repositories');

(async () => {
  try {
    const user = await UserRepository.create({
      roles: [USER_ROLES.ADMIN],
      username: 'admin',
      password: await UserRepository.getHashPassword('asdlolasd'),
      email: 'stankovic.aleksandar@elfak.rs',
    });
    console.log('Created', user);
  } catch (error) {
    console.log('Error occured while seeding admins');
    console.error(error.errmsg, `code: ${error.code}`);
    return process.exit(1);
  }
  process.exit(0);
})();
