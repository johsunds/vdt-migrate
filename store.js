const api = require('@vidispine/vdt-api');

const { utils: { isRequired } } = api;

class VidispineStore {
  constructor({
    configurationProperty = isRequired(),
  }) {
    this.configurationProperty = configurationProperty;
  }

  async save(set, fn) {
    try {
      await api.configuration.updatePropertiesConfiguration({
        configurationPropertyDocument: {
          key: this.configurationProperty,
          value: JSON.stringify({
            lastRun: set.lastRun,
            migrations: set.migrations,
          }),
        },
      });
    } catch (err) {
      return fn(err);
    }

    return fn(null);
  }

  async load(fn) {
    try {
      const { data: { property: properties } } = await api.configuration
        .getPropertiesConfiguration();
      const { value: json } = properties.find(
        ({ key }) => key === this.configurationProperty,
      ) || {};
      const state = json ? JSON.parse(json) : {};
      return fn(null, state);
    } catch (e) {
      return fn(e);
    }
  }
}

module.exports = VidispineStore;
