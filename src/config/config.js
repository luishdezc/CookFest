

import dotenv from 'dotenv';

const envFile = '.env';
dotenv.config({ path: envFile });

class Config {
  static PORT = process.env.PORT || 10000;
  static SERVER = process.env.SERVER || '0.0.0.0';
  static DB_HOST = process.env.DB_HOST;
  static SECRET = process.env.SECRET;
}

export default Config;