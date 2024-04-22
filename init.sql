CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS feedback (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL
);

