-- 1. Remove duplicate profiles, keeping only the most recently updated one for each user
DELETE FROM profiles
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM profiles
    ORDER BY user_id, updated_at DESC
);

-- 2. Add a unique constraint to the user_id column to prevent future duplicates
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
