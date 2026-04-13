Schema for Supabase PostgreSQL Tables

# Users

| Column Name   | Type        |
| ------------- | ----------- |
| id            | int8        |
| created_at    | timestamptz |
| email         | text        |
| first_name    | text        |
| last_name     | text        |
| home_town     | text        |
| home_state    | text        |
| social_links  | _text       |
| avatar_url    | text        |

# Auth Metadata

User passwords are hashed using Node's `crypto.scryptSync()` with a 16-byte salt before registration. The resulting `salt:hash` string is saved in Supabase Auth's `user_metadata` as `password_hash`. No plaintext passwords are persisted anywhere in the database.

# Academics

| Column Name    | Type        |
| -------------- | ----------- |
| id             | int8        |
| created_at     | timestamptz |
| user_id        | int8        |
| academic_year  | text        |
| major          | text        |
| minor          | _text       |
| gpa            | float4      |

# Living Styles

| Column Name      | Type        |
| ---------------- | ----------- |
| id               | int8        |
| created_at       | timestamptz |
| user_id          | int8        |
| time_sleep       | time        |
| time_wake        | time        |
| comfortable_temp | int2        |
| noise_level      | int2        |
| music_genre      | _text       |
| cleanliness      | int2        |

# Interests

| Column Name  | Type        |
| ------------ | ----------- |
| id           | int8        |
| created_at   | timestamptz |
| user_id      | int8        |
| name         | text        |
| description  | text        |
| emoji        | varchar     |
