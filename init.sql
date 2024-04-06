CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS feedback (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      message TEXT NOT NULL
);

INSERT INTO feedback (name, email, message) VALUES ('name', 'email@example.com', 'I love the app!');
