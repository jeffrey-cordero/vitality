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

CREATE index "usersEmailIndex" ON "Users" (email);

CREATE TABLE "VerificationToken" (
      identifier TEXT PRIMARY KEY NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "Workouts" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      title VARCHAR(50) NOT NULL, 
      date DATE NOT NULL,
      reflection TEXT,
      image TEXT DEFAULT 'DEFAULT'
);

CREATE TABLE "Exercises" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workout_id UUID NOT NULL REFERENCES "Workouts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      title VARCHAR(50),
      weight INTEGER,
      duration INTERVAL
);

CREATE TABLE "Tags" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      page VARCHAR(15) NOT NULL,
      title VARCHAR(30) NOT NULL,
      color VARCHAR(7) DEFAULT '#D6DBDF'
);

CREATE TABLE "Workout_Tags" (
      workout_id UUID NOT NULL REFERENCES "Workouts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      tag_id UUID NOT NULL REFERENCES "Tags"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      PRIMARY KEY (workout_id, tag_id)
);

CREATE TABLE "Feedback" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
);
