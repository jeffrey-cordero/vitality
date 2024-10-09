CREATE TABLE "users" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      birthday DATE NOT NULL,
      username VARCHAR(30) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      phone VARCHAR(22) UNIQUE,
      phone_verified BOOLEAN DEFAULT FALSE
);

CREATE index "users_email_index" ON "users" (email);

CREATE TABLE "verification_token" (
      identifier TEXT PRIMARY KEY NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "workouts" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      title VARCHAR(50) NOT NULL, 
      date DATE NOT NULL,
      description TEXT,
      image TEXT
);

CREATE index "workouts_user_index" ON "workouts" (user_id);

CREATE TABLE "exercises" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workout_id UUID NOT NULL REFERENCES "workouts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      exercise_order INTEGER NOT NULL,
      title VARCHAR(50) NOT NULL
);

CREATE INDEX "exercises_workout_index" ON "exercises" (workout_id);

CREATE TABLE "sets" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id UUID NOT NULL REFERENCES "exercises"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      set_order INTEGER NOT NULL,
      weight INTEGER,
      hours INTEGER,
      minutes INTEGER,
      seconds INTEGER,
      repetitions INTEGER,
      text TEXT
);

CREATE INDEX "sets_exercise_index" ON "sets" (exercise_id);

CREATE TABLE "workout_tags" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      title VARCHAR(30) NOT NULL,
      color VARCHAR(20) NOT NULL DEFAULT 'rgb(90, 90, 90)',
      CONSTRAINT unique_user_title UNIQUE (user_id, title)
);

CREATE INDEX "tags_user_index" ON "workout_tags" (user_id);
CREATE INDEX "tags_title_index" ON "workout_tags" (title);

CREATE TABLE "workout_applied_tags" (
      workout_id UUID NOT NULL REFERENCES "workouts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      tag_id UUID NOT NULL REFERENCES "workout_tags"(id) ON DELETE CASCADE ON UPDATE CASCADE,
      PRIMARY KEY (workout_id, tag_id)
);

CREATE INDEX "workout_tags_workout_index" ON "workout_applied_tags" (workout_id);
CREATE INDEX "workout_tags_tag_index" ON "workout_applied_tags" (tag_id);

CREATE TABLE "feedback" (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
);