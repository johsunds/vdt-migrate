const migrate = require('migrate');
const fs = require('fs').promises;
const path = require('path');
const vdtApi = require('@vidispine/vdt-api');

const { utils: { isRequired } } = vdtApi;

const VidispineStore = require('./store');

module.exports.utils = require('./utils');

module.exports.login = ({
  baseURL = isRequired(),
  username = isRequired(),
  password = isRequired(),
}) => {
  vdtApi.utils.login({baseURL, username, password});
};

module.exports.create = async ({
  name = isRequired(),
  migrationsDirectory = isRequired(),
}) => {
  await fs.mkdir(migrationsDirectory, { recursive: true });
  const migrationFileName = `${Date.now()}-${name}.js`;
  const template = await fs.readFile(path.join(__dirname, 'template.js'));
  await fs.writeFile(path.join(migrationsDirectory, migrationFileName), template, 'utf8');
  return path.join(migrationsDirectory, migrationFileName);
};

module.exports.migrate = async ({
  migrationsDirectory = isRequired(),
  migrationsProperty = isRequired(),
  direction = isRequired(),
  migration = null,
  context = {},
  force = false,
  count = 1,
  dryRun = false,
  onMigration = () => {},
  onWarning = () => {},
}) => new Promise((resolve, reject) => {
  migrate.load({
    stateStore: new VidispineStore({
      configurationProperty: migrationsProperty,
    }),
    migrationsDirectory,
    ignoreMissing: true,
  }, (loadErr, set) => {
    if (loadErr) {
      reject(loadErr);
    }
    set.on('warning', onWarning);
    set.on('migration', onMigration);
    set.migrate(direction, migration, (err) => {
      if (err) { reject(err); } else { resolve(); }
    }, context, { count, force, dryRun });
  });
});

module.exports.current = async ({
  migrationsProperty = isRequired(),
  migrationsDirectory = isRequired(),
}) => new Promise((resolve, reject) => {
  migrate.load({
    stateStore: new VidispineStore({
      configurationProperty: migrationsProperty,
    }),
    migrationsDirectory,
    ignoreMissing: true,
  }, (loadErr, set) => {
    if (loadErr) {
      reject(loadErr);
    }
    resolve(set.lastRun);
  });
});
