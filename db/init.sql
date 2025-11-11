CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO tasks (title, completed)
  VALUES ('Welcome: create your first task', false)
  ON CONFLICT DO NOTHING;
