-- Remove test users created by multiplayer test scripts
-- Test users are identified by their @example.com email addresses
-- This script cascades deletions through related tables

BEGIN;

-- Show what will be deleted before committing
SELECT id, username, email, created_at
FROM users
WHERE email LIKE '%@example.com'
ORDER BY created_at;

-- Delete related records first (if not using CASCADE on FK constraints)
-- Identify test user IDs and their game IDs for cascaded cleanup
CREATE TEMP TABLE test_user_ids AS
   SELECT id FROM users WHERE email LIKE '%@example.com';

CREATE TEMP TABLE test_game_ids AS
   SELECT id FROM multiplayer_games WHERE host_id IN (SELECT id FROM test_user_ids);

CREATE TEMP TABLE test_player_ids AS
   SELECT id FROM multiplayer_game_players
   WHERE user_id IN (SELECT id FROM test_user_ids)
      OR game_id IN (SELECT id FROM test_game_ids);

CREATE TEMP TABLE test_round_ids AS
   SELECT id FROM multiplayer_game_rounds
   WHERE game_id IN (SELECT id FROM test_game_ids);

-- Delete leaf tables first
DELETE FROM player_answers
WHERE player_id IN (SELECT id FROM test_player_ids)
   OR round_id IN (SELECT id FROM test_round_ids);

DELETE FROM multiplayer_game_rounds
WHERE id IN (SELECT id FROM test_round_ids);

DELETE FROM multiplayer_game_players
WHERE id IN (SELECT id FROM test_player_ids);

DELETE FROM invites
WHERE sender_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')
   OR receiver_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

DELETE FROM invites
WHERE game_id IN (SELECT id FROM test_game_ids);

DELETE FROM multiplayer_games
WHERE id IN (SELECT id FROM test_game_ids);

DELETE FROM game_participants
WHERE user_id IN (SELECT id FROM test_user_ids);

DELETE FROM games
WHERE created_by_id IN (SELECT id FROM test_user_ids);

DELETE FROM scores
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

DELETE FROM user_progresses
WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

-- Delete the test users themselves
DELETE FROM users
WHERE email LIKE '%@example.com';

SELECT 'Done. Test users removed.' AS result;

COMMIT;
