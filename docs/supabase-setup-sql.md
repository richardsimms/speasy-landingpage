CREATE TABLE public.audio_files (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  content_id uuid NULL,
  file_url text NOT NULL,
  duration integer NULL,
  format text NULL,
  type text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT audio_files_pkey PRIMARY KEY (id),
  CONSTRAINT audio_files_content_id_fkey FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
);

CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text NULL,
  published_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  is_published boolean NULL DEFAULT true,
  author text NULL DEFAULT 'Speasy Team'::text,
  category text NULL DEFAULT 'Release Notes'::text,
  image_url text NULL,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts USING btree (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts USING btree (published_at);

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL,
  description text NULL,
  image_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_slug_key UNIQUE (slug)
);

CREATE TABLE public.content_item_tags (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  content_id uuid NULL,
  tag_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT content_item_tags_pkey PRIMARY KEY (id),
  CONSTRAINT content_item_tags_content_id_tag_id_key UNIQUE (content_id, tag_id),
  CONSTRAINT content_item_tags_content_id_fkey FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
  CONSTRAINT content_item_tags_tag_id_fkey1 FOREIGN KEY (tag_id) REFERENCES categories(id)
);

CREATE TABLE public.content_items (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  url text NOT NULL,
  content text NULL,
  summary text NULL,
  source_id uuid NULL,
  published_at timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT content_items_pkey PRIMARY KEY (id),
  CONSTRAINT content_items_url_key UNIQUE (url),
  CONSTRAINT content_items_source_id_fkey FOREIGN KEY (source_id) REFERENCES content_sources(id)
);
CREATE INDEX IF NOT EXISTS content_items_published_at_idx ON public.content_items USING btree (published_at DESC);

CREATE TABLE public.content_sources (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  url text NOT NULL,
  feed_url text NULL,
  category_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT content_sources_pkey PRIMARY KEY (id),
  CONSTRAINT content_sources_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE public.llm_jobs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  content_id uuid NOT NULL,
  status text NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT llm_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT llm_jobs_content_id_fkey FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
);

CREATE TABLE public.podcast_feeds (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  title text NOT NULL,
  description text NOT NULL,
  feed_url text NOT NULL,
  is_default boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT podcast_feeds_pkey PRIMARY KEY (id),
  CONSTRAINT podcast_feeds_user_id_feed_url_key UNIQUE (user_id, feed_url),
  CONSTRAINT unique_default_feed_per_user UNIQUE (user_id, feed_url),
  CONSTRAINT podcast_feeds_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  category_preferences text[] NULL,
  listening_context text NULL,
  session_length text NULL,
  preferred_tone text NULL,
  exclusions text NULL,
  other_category text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_name_key UNIQUE (name)
);

CREATE TABLE public.user_category_subscriptions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  category_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_category_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_category_subscriptions_user_id_category_id_key UNIQUE (user_id, category_id),
  CONSTRAINT user_category_subscriptions_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT user_category_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS user_category_subscriptions_user_id_idx ON public.user_category_subscriptions USING btree (user_id);

CREATE TABLE public.user_content_items (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  content_id uuid NULL,
  is_read boolean NULL DEFAULT false,
  is_favorite boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_content_items_pkey PRIMARY KEY (id),
  CONSTRAINT user_content_items_user_id_content_id_key UNIQUE (user_id, content_id),
  CONSTRAINT user_content_items_content_id_fkey FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
  CONSTRAINT user_content_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS user_content_items_user_id_idx ON public.user_content_items USING btree (user_id);