// Higher-level utility functions for creating migrations
const api = require('@vidispine/vdt-api');

// https://apidoc.vidispine.com/latest/item/metadata/metadata.html?#metadata-defined-by-the-systems
const systemFields = [
  'user',
  'title',
  'shapeTag',
  'representativeThumbnail',
  'representativeThumbnailNoAuth',
  'itemId',
  'mediaType',
  'mimeType',
  'created',
  'startTimeCode',
  'startSeconds',
  'fieldValidationError',
  'schemaValidationError',
  'originalFilename',
  'originalAudioCodec',
  'originalVideoCodec',
  'originalHeight',
  'originalWidth',
  'originalFormat',
  'durationSeconds',
  'durationTimeCode',
];

const systemGroups = [
  'mrk_marker',
  'stl_tti',
  'pho_resource',
  'facedetect_rect',
  'stl_gsiHeader',
  'pho_validation',
  'pho_error',
  'facedetect_face',
  'stl_subtitle',
  'originalTrackFilename',
  'stl_gsi',
];

const removeFields = async (fields) => Promise.all(
  fields.map(({ name: fieldName }) => {
    if (systemFields.includes(fieldName)) {
      return Promise.resolve();
    }
    return api.metadatafield.removeMetadataField({ fieldName });
  }),
);

module.exports.removeGroup = async (
  { name: groupName, group: groups, field: fields },
  options,
) => {
  const { recursive = false } = options;
  if (!systemGroups.includes(groupName)) {
    await api.fieldgroup.removeFieldGroup({ groupName });
  }
  if (recursive && fields && fields.length > 0) {
    await removeFields(fields);
  }
  if (recursive && groups && groups.length > 0) {
    await Promise.all(
      groups.map((group) => module.exports.removeGroup(group, options)),
    );
  }
};

module.exports.setConfigurationProperty = async (key, value) => api
  .configuration.updatePropertiesConfiguration({
    configurationPropertyDocument: {
      key,
      value,
    },
  });

module.exports.removeConfigurationProperty = async (key) => api
  .configuration.removePropertiesConfiguration({ key });
