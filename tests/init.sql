CREATE TABLE "Users" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      birthday DATE NOT NULL,
      username VARCHAR(30) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
      phone VARCHAR(22) UNIQUE,
      phoneVerified BOOLEAN DEFAULT FALSE
);

CREATE TABLE "VerificationToken" (
    identifier TEXT PRIMARY KEY NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TIMESTAMP WITHOUT TIME ZONE NOT NULL
);


CREATE TABLE "Workouts" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      image TEXT,
      user_id UUID REFERENCES Users(name)
);

CREATE TABLE "Feedback" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
);
