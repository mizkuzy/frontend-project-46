import yaml from 'js-yaml';

const parseData = (data, format) => {
  switch (format) {
    case 'JSON':
      return JSON.parse(data);
    case 'YML':
    case 'YAML':
      return yaml.load(data);
    default:
      throw new Error(`Unsupported format ${format}`);
  }
};

export default parseData;
