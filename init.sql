CREATE TABLE "User" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      birthday DATE NOT NULL,
      username VARCHAR(30) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
      phone VARCHAR(20) UNIQUE,
      phoneVerified BOOLEAN DEFAULT FALSE
);

CREATE TABLE "VerificationToken" (
    identifier TEXT PRIMARY KEY NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "Feedback" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL
);
