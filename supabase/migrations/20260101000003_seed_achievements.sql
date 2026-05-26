-- Seed: Achievements
-- trigger_condition JSONB schema:
--   auto_visit:        { "type": "visit_count", "tier": 1, "min_count": N }
--                      { "type": "visit_presidents", "president_numbers": [N, ...] }
--                      { "type": "visit_era", "era": "founding" }
--                      { "type": "coast_to_coast" }
--                      { "type": "visit_states", "states": ["TX",...], "min_count": N }
--                      { "type": "visit_and_log", "requires": ["notes","photos","moments"], "min_count": N }
--                      { "type": "visit_states_count", "min_states": N }
--                      { "type": "total_miles", "min_miles": N }
--                      { "type": "read_dossier", "min_count": N }
--   quiz:              { "type": "quiz_complete", "min_count": N }
--                      { "type": "quiz_perfect_score" }
--                      { "type": "quiz_complete_nara", "min_count": N }
--   manual_once/repeatable: { "type": "manual" }

INSERT INTO achievements
  (name, description, category, icon, points, tracking_type, trigger_condition)
VALUES

-- ─────────────────────────────────────────────────────────────
-- 🏛️  THE PRESIDENTIAL TRAIL
-- ─────────────────────────────────────────────────────────────

(
  'First Briefing',
  'Log your very first presidential library or historic site visit.',
  'trail', '🏛️', 25, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 1}'::jsonb
),
(
  'The Founding',
  'Visit a site associated with a Founding Era president (Washington through Monroe).',
  'trail', '🦅', 50, 'auto_visit',
  '{"type": "visit_era", "era": "founding"}'::jsonb
),
(
  'The Modern Era',
  'Visit your first official NARA Presidential Library.',
  'trail', '📁', 50, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 1}'::jsonb
),
(
  'Coast to Coast',
  'Visit presidential libraries on both the East and West Coasts.',
  'trail', '🌊', 75, 'auto_visit',
  '{"type": "coast_to_coast"}'::jsonb
),
(
  'The Full Cabinet',
  'Visit 5 presidential libraries.',
  'trail', '💼', 100, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 5}'::jsonb
),
(
  'Majority Leader',
  'Visit 8 presidential libraries.',
  'trail', '🗳️', 150, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 8}'::jsonb
),
(
  'Super Majority',
  'Visit 12 presidential libraries.',
  'trail', '⚖️', 200, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 12}'::jsonb
),
(
  'The Full 15',
  'Visit all 15 official NARA Presidential Libraries.',
  'trail', '🏆', 500, 'auto_visit',
  '{"type": "visit_count", "tier": 1, "min_count": 15}'::jsonb
),
(
  'Commander in Chief',
  'Complete all 15 NARA libraries AND visit 10 or more historic sites.',
  'trail', '⭐', 1000, 'auto_visit',
  '{"type": "libraries_and_sites", "min_libraries": 15, "min_sites": 10}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- 🗺️  GEOGRAPHY
-- ─────────────────────────────────────────────────────────────

(
  'New England Circuit',
  'Visit presidential sites across the northeastern United States.',
  'geography', '🗺️', 75, 'auto_visit',
  '{"type": "visit_states", "states": ["MA", "NY", "ME", "NH", "VT", "CT", "RI", "NJ"], "min_count": 3}'::jsonb
),
(
  'Deep South',
  'Visit the LBJ, Carter, and Clinton presidential libraries.',
  'geography', '🌿', 75, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [36, 39, 42]}'::jsonb
),
(
  'Lone Star Legacy',
  'Visit all three Texas presidential libraries (LBJ, George H.W. Bush, George W. Bush).',
  'geography', '⭐', 100, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [36, 41, 43]}'::jsonb
),
(
  'California Dreamin''',
  'Visit both California presidential libraries — Nixon and Reagan.',
  'geography', '🌴', 75, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [37, 40]}'::jsonb
),
(
  'Heartland',
  'Visit the Hoover, Truman, and Eisenhower presidential libraries.',
  'geography', '🌾', 75, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [31, 33, 34]}'::jsonb
),
(
  'Midwest Swing',
  'Visit the Gerald Ford library and any Great Lakes-region presidential site.',
  'geography', '🏙️', 50, 'auto_visit',
  '{"type": "visit_presidents_plus_region", "required_numbers": [38], "region_states": ["MI", "OH", "IN", "IL", "WI", "MN"], "min_region_count": 1}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- 📜  HISTORICAL FIGURES
-- ─────────────────────────────────────────────────────────────

(
  'Founding Father',
  'Visit Mount Vernon, the home of George Washington.',
  'historical', '🦅', 50, 'auto_visit',
  '{"type": "visit_location_name", "name": "Mount Vernon"}'::jsonb
),
(
  'Honest Abe',
  'Visit the Abraham Lincoln Presidential Library and Museum.',
  'historical', '🎩', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [16]}'::jsonb
),
(
  'The Rough Rider',
  'Visit the Theodore Roosevelt Presidential Library.',
  'historical', '🐻', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [26]}'::jsonb
),
(
  'Camelot',
  'Visit the John F. Kennedy Presidential Library and Museum.',
  'historical', '🕊️', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [35]}'::jsonb
),
(
  'The Great Society',
  'Visit the Lyndon Baines Johnson Presidential Library.',
  'historical', '🤠', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [36]}'::jsonb
),
(
  'I Am Not a Crook',
  'Visit the Richard Nixon Presidential Library and Museum.',
  'historical', '✌️', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [37]}'::jsonb
),
(
  'Morning in America',
  'Visit the Ronald Reagan Presidential Library and Museum.',
  'historical', '🎬', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [40]}'::jsonb
),
(
  'The Decision Points',
  'Visit the George W. Bush Presidential Center.',
  'historical', '🌵', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [43]}'::jsonb
),
(
  'Yes We Can',
  'Visit the Barack Obama Presidential Center.',
  'historical', '🇺🇸', 50, 'auto_visit',
  '{"type": "visit_presidents", "president_numbers": [44]}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- 🏆  EXPERIENCE ACHIEVEMENTS
-- ─────────────────────────────────────────────────────────────

(
  'Oval Office',
  'Sit in a replica Oval Office at a presidential library.',
  'experience', '🏛️', 75, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'Air Force One',
  'Board the actual Air Force One at the Reagan Library.',
  'experience', '✈️', 100, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'The War Room',
  'Explore a Situation Room or War Room exhibit at a presidential library.',
  'experience', '📡', 75, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'Living History',
  'Attend a special event, lecture, or temporary exhibition at a presidential site.',
  'experience', '🎟️', 50, 'manual_repeatable',
  '{"type": "manual"}'::jsonb
),
(
  'The Archives',
  'Visit the National Archives in Washington, D.C.',
  'experience', '📜', 75, 'auto_visit',
  '{"type": "visit_location_name", "name": "National Archives"}'::jsonb
),
(
  'White House Tour',
  'Tour the White House.',
  'experience', '🏠', 150, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'Watergate',
  'View the Nixon Watergate exhibit at the Nixon Presidential Library.',
  'experience', '🔐', 50, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'Presidential Passport',
  'Get your physical presidential passport book stamped at a library.',
  'experience', '📕', 50, 'manual_repeatable',
  '{"type": "manual"}'::jsonb
),
(
  'Berlin Wall',
  'See a section of the Berlin Wall on display at the Reagan Library.',
  'experience', '🧱', 50, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  '9/11 Memorial Steel',
  'View the World Trade Center steel artifact at the George W. Bush Library.',
  'experience', '🕯️', 50, 'manual_once',
  '{"type": "manual"}'::jsonb
),
(
  'Recorded in History',
  'Listen to actual presidential audio recordings at a library exhibit.',
  'experience', '🎙️', 50, 'manual_once',
  '{"type": "manual"}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- 🧠  KNOWLEDGE
-- ─────────────────────────────────────────────────────────────

(
  'First Briefing Quiz',
  'Complete your first presidential trivia quiz.',
  'knowledge', '📝', 25, 'quiz',
  '{"type": "quiz_complete", "min_count": 1}'::jsonb
),
(
  'Commander''s Quiz',
  'Score 100% on any presidential trivia quiz.',
  'knowledge', '💯', 50, 'quiz',
  '{"type": "quiz_perfect_score"}'::jsonb
),
(
  'History Scholar',
  'Complete 5 presidential trivia quizzes.',
  'knowledge', '📚', 75, 'quiz',
  '{"type": "quiz_complete", "min_count": 5}'::jsonb
),
(
  'Presidential Professor',
  'Complete trivia quizzes for all 15 NARA presidential libraries.',
  'knowledge', '🎓', 200, 'quiz',
  '{"type": "quiz_complete_nara", "min_count": 15}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- ✍️  JOURNAL
-- ─────────────────────────────────────────────────────────────

(
  'The Chronicler',
  'Write personal notes on 5 different library visits.',
  'journal', '✍️', 50, 'auto_visit',
  '{"type": "notes_on_visits", "min_count": 5}'::jsonb
),
(
  'Biographer',
  'Log a single visit with photos, notes, AND personal moments.',
  'journal', '📸', 75, 'auto_visit',
  '{"type": "full_log_visit", "requires": ["photos", "notes", "moments"]}'::jsonb
),
(
  'The Historian',
  'Log all 15 NARA library visits with complete notes, photos, and moments.',
  'journal', '📖', 200, 'auto_visit',
  '{"type": "full_log_all_nara", "requires": ["photos", "notes", "moments"]}'::jsonb
),

-- ─────────────────────────────────────────────────────────────
-- 🌟  LEGENDARY
-- ─────────────────────────────────────────────────────────────

(
  'All-American',
  'Visit presidential sites across 10 or more different U.S. states.',
  'legendary', '🗽', 150, 'auto_visit',
  '{"type": "visit_states_count", "min_states": 10}'::jsonb
),
(
  'The Full Dossier',
  'Read the complete president dossier for 10 different presidents in the app.',
  'legendary', '🗂️', 100, 'auto_visit',
  '{"type": "read_dossier", "min_count": 10}'::jsonb
),
(
  'Road Scholar',
  'Log 500 or more total miles driven on presidential trail trips.',
  'legendary', '🚗', 100, 'auto_visit',
  '{"type": "total_miles", "min_miles": 500}'::jsonb
);
