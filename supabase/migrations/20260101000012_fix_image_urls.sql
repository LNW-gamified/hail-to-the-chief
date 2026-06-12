-- Fix tier 2/3 image URLs.
--
-- The previous migration (011) used Wikimedia Commons thumbnail URLs with
-- manually-guessed MD5 hash path prefixes (e.g. /a/a1/, /6/6b/). Wikimedia
-- thumbnail URLs require the CORRECT MD5 hash prefix to resolve; wrong prefixes
-- return 404s.  This migration replaces every tier 2/3 image_url with
-- Special:FilePath redirect URLs, which resolve correctly regardless of the
-- hash path, using only the canonical filename.
--
-- Format: https://commons.wikimedia.org/wiki/Special:FilePath/<filename>?width=800
-- Plain <img> tags follow the resulting 302 redirect automatically.

-- ── Tier 3 — existing monuments / experiences ─────────────────────────────────

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/White_House_DC.jpg?width=800'
WHERE name = 'The White House';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/National_Archives_Building%2C_Washington%2C_D.C..JPG?width=800'
WHERE name = 'National Archives Museum';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Arlington_National_Cemetery_aerial_view_March_2015.jpg?width=800'
WHERE name = 'Arlington National Cemetery';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/US_Capitol_west_side.JPG?width=800'
WHERE name = 'United States Capitol';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Thomas_Jefferson_Memorial.jpg?width=800'
WHERE name = 'Thomas Jefferson Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lincoln_Memorial_NPS.jpg?width=800'
WHERE name = 'Lincoln Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Washington_Monument_Dusk_Jan_2006.jpg?width=800'
WHERE name = 'Washington Monument';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Vietnam_Veterans_Memorial.jpg?width=800'
WHERE name = 'Vietnam Veterans Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Korean_War_Veterans_Memorial.jpg?width=800'
WHERE name = 'Korean War Veterans Memorial';

-- ── New tier 3 inserts (from migration 011) ───────────────────────────────────

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Martin_Luther_King_Jr._Memorial.jpg?width=800'
WHERE name = 'Martin Luther King Jr. Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Rushmore_14mb.jpg?width=800'
WHERE name = 'Mount Rushmore National Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Franklin_Delano_Roosevelt_Memorial.jpg?width=800'
WHERE name = 'Franklin Delano Roosevelt Memorial';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Dealey_Plaza_2014.jpg?width=800'
WHERE name = 'The Sixth Floor Museum at Dealey Plaza';

-- ── New tier 2 inserts (from migration 011) ───────────────────────────────────

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/MLK_Birth_Home.jpg?width=800'
WHERE name = 'Martin Luther King Jr. National Historical Park';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Eisenhower_farm_house.jpg?width=800'
WHERE name = 'Eisenhower National Historic Site';

-- ── Tier 2 — historic sites (images not set before) ──────────────────────────

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Vernon_from_the_Potomac_River.jpg?width=800'
WHERE name = 'George Washington''s Mount Vernon';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Adams_NHP_Quincy_MA.jpg?width=800'
WHERE name = 'Adams National Historical Park';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Monticello%2C_Jefferson%27s_Home_-_Flickr_-_hyku_%281%29.jpg?width=800'
WHERE name = 'Monticello — Home of Thomas Jefferson';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/The_Hermitage_mansion%2C_Nashville%2C_Tennessee.jpg?width=800'
WHERE name = 'The Hermitage — Home of President Andrew Jackson';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Lincoln_Home_National_Historic_Site.jpg?width=800'
WHERE name = 'Lincoln Home National Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Abraham_Lincoln_Presidential_Library_and_Museum.jpg?width=800'
WHERE name = 'Abraham Lincoln Presidential Library and Museum';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Ford%27s_Theatre_National_Historic_Site.jpg?width=800'
WHERE name = 'Ford''s Theatre National Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Gettysburg_National_Military_Park.jpg?width=800'
WHERE name = 'Gettysburg National Military Park';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Sagamore_Hill_National_Historic_Site.jpg?width=800'
WHERE name = 'Sagamore Hill National Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Theodore_Roosevelt_Birthplace_NHS.jpg?width=800'
WHERE name = 'Theodore Roosevelt Birthplace National Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Woodrow_Wilson_House%2C_Washington_D.C..jpg?width=800'
WHERE name = 'Woodrow Wilson House';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/FDR_Little_White_House_Warm_Springs_GA.jpg?width=800'
WHERE name = 'FDR''s Little White House State Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/John_F._Kennedy_National_Historic_Site.jpg?width=800'
WHERE name = 'John Fitzgerald Kennedy National Historic Site';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/LBJ_Ranch_Stonewall_TX.jpg?width=800'
WHERE name = 'Lyndon B. Johnson National Historical Park — LBJ Ranch';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Jimmy_Carter_National_Historical_Park.jpg?width=800'
WHERE name = 'Jimmy Carter National Historical Park';

UPDATE presidential_locations SET image_url =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Rancho_del_Cielo_Reagan_Ranch.jpg?width=800'
WHERE name = 'Rancho del Cielo — Reagan Ranch';
