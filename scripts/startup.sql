CREATE TABLE surveys (
   id SERIAL PRIMARY KEY,
   name character varying NOT NULL,
   email character varying NOT NULL,
   message text varying NOT NULL
);