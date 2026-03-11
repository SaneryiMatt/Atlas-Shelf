CREATE TYPE item_type AS ENUM ('book', 'screen', 'travel');
CREATE TYPE item_status AS ENUM ('wishlist', 'planned', 'in_progress', 'completed', 'paused');
CREATE TYPE screen_format AS ENUM ('movie', 'series', 'anime', 'documentary');
CREATE TYPE travel_stage AS ENUM ('idea', 'planning', 'booked', 'visited');

CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type item_type NOT NULL,
  status item_status NOT NULL DEFAULT 'wishlist',
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  cover_image_url text,
  rating numeric(3, 1),
  priority integer NOT NULL DEFAULT 3,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamp,
  completed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE book_details (
  item_id uuid PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  author text NOT NULL,
  page_count integer,
  isbn text,
  publisher text,
  published_on date,
  language text,
  format text
);

CREATE TABLE screen_details (
  item_id uuid PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  format screen_format NOT NULL,
  director text,
  studio text,
  release_year integer,
  runtime_minutes integer,
  episode_count integer,
  season_count integer,
  platform text
);

CREATE TABLE travel_details (
  item_id uuid PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
  city text,
  region text,
  country text NOT NULL,
  stage travel_stage NOT NULL DEFAULT 'idea',
  start_date date,
  end_date date,
  estimated_budget numeric(10, 2),
  travel_style text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb
);

