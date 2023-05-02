import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : 'development.env';
  let filePath: string = resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}

const parseValue = value => {
  switch (String(value).toLowerCase().trim()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      if (value === +value) {
        return Number(value);
      }

      return String(value);
  }
};

export const env = (property: string, defaultValue?) => {
  const value = process.env[property];

  return !(typeof value === 'undefined')
    ? parseValue(value)
    : defaultValue;
};
