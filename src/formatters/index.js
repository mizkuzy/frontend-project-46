import stylish from './stylish.js';
import plain from './plain.js';

const getFormattedDiff = (diff, type) => {
  if (type === 'stylish') {
    return stylish(diff);
  }

  if (type === 'plain') {
    return plain(diff);
  }

  if (type === 'json') {
    return JSON.stringify(diff);
  }

  throw new Error('Unexpected format type');
};

export default getFormattedDiff;
