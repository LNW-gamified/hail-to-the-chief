-- Add year_established to all presidential_locations
ALTER TABLE presidential_locations
ADD COLUMN IF NOT EXISTS year_established INTEGER;


-- ============================================================
-- INSERT new tier 2/3 locations not in original seed
-- ============================================================

-- MLK Memorial (Washington DC, tier 3 monument)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  NULL,
  'Martin Luther King Jr. Memorial',
  'monument', 3,
  '1964 Independence Avenue Southwest', 'Washington', 'DC',
  38.8864, -77.0441,
  'A 30-foot granite sculpture called the Stone of Hope rising from the Mountain of Despair, honoring the civil rights leader whose "I Have a Dream" speech reshaped American democracy.',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/mlkm',
  ARRAY['Stone of Hope sculpture','Inscriptions from MLK speeches','Mountain of Despair entrance','Tidal Basin waterfront view','I Have a Dream inscription'],
  2011, true
);

-- MLK National Historical Park (Atlanta, GA, tier 2 historic site)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  NULL,
  'Martin Luther King Jr. National Historical Park',
  'historic_site', 2,
  '450 Auburn Avenue Northeast', 'Atlanta', 'GA',
  33.7550, -84.3742,
  'The birthplace, childhood home, church, and tomb of Dr. Martin Luther King Jr., preserving the Auburn Avenue neighborhood that shaped America''s greatest civil rights leader.',
  'Daily 9am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Free admission',
  'https://www.nps.gov/malu',
  ARRAY['MLK Birth Home at 501 Auburn Ave','Ebenezer Baptist Church','Freedom Hall crypt and tomb','International Civil Rights Walk of Fame','I Have a Dream gallery'],
  1980, true
);

-- Mount Rushmore (South Dakota, tier 3 monument)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  NULL,
  'Mount Rushmore National Memorial',
  'monument', 3,
  '13000 South Dakota Highway 244', 'Keystone', 'SD',
  43.8791, -103.4591,
  'Sculptor Gutzon Borglum carved the 60-foot faces of Washington, Jefferson, Theodore Roosevelt, and Lincoln into the granite of the Black Hills between 1927 and 1941.',
  'Daily 5am–11pm (grounds); Visitor Center 8am–10pm',
  'Free (parking fee $10)',
  'https://www.nps.gov/moru',
  ARRAY['Presidential sculpture faces','Lincoln Borglum Museum','Presidential Trail walk','Sculptor''s Studio','Evening lighting ceremony (summer)'],
  1941, true
);

-- FDR Memorial (Washington DC, tier 3 monument)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  (SELECT id FROM presidents WHERE number = 32),
  'Franklin Delano Roosevelt Memorial',
  'monument', 3,
  '400 West Basin Drive Southwest', 'Washington', 'DC',
  38.8832, -77.0442,
  'A 7.5-acre outdoor memorial along the Tidal Basin with four outdoor rooms representing FDR''s four terms, featuring waterfalls, bronze sculptures, and inscriptions from his most resonant speeches.',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/frde',
  ARRAY['Four-room outdoor gallery','Breadline Depression sculpture','FDR in wheelchair sculpture','Eleanor Roosevelt statue','New Deal and WWII inscriptions'],
  1997, true
);

-- The Sixth Floor Museum at Dealey Plaza (Dallas TX, tier 3 experience)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  (SELECT id FROM presidents WHERE number = 35),
  'The Sixth Floor Museum at Dealey Plaza',
  'experience', 3,
  '411 Elm Street', 'Dallas', 'TX',
  32.7800, -96.8082,
  'Located on the sixth floor of the former Texas School Book Depository, the museum chronicles the assassination of President Kennedy on November 22, 1963, and its enduring impact on America.',
  'Daily 10am–6pm; closed Christmas Day',
  'Adults $21; Seniors $18; Ages 6–18 $15; Ages 5 and under free',
  'https://www.jfk.org',
  ARRAY['Sniper''s nest corner window','Dealey Plaza overlook','Kennedy assassination timeline','Oswald investigation exhibits','Original 1963 news footage'],
  1989, true
);

-- Eisenhower National Historic Site (Gettysburg PA, tier 2 historic site)
INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, year_established, is_active)
VALUES (
  (SELECT id FROM presidents WHERE number = 34),
  'Eisenhower National Historic Site',
  'home', 2,
  '1395 Balachey Road', 'Gettysburg', 'PA',
  39.8071, -77.2543,
  'The only home Dwight and Mamie Eisenhower ever owned, a 690-acre farm adjacent to the Gettysburg battlefield where Ike entertained world leaders and retired after his presidency.',
  'Daily 9am–5pm (Apr–Oct); reduced hours Nov–Mar; closed Thanksgiving, Christmas',
  'Adults $10; Ages 15 and under free',
  'https://www.nps.gov/eise',
  ARRAY['Eisenhower farmhouse home tour','Putting green Ike built','Skeet range','Gettysburg battlefield views','Eisenhower and Khrushchev diplomacy exhibit'],
  1969, true
);


-- ============================================================
-- UPDATE image_url for existing tier 3 locations
-- ============================================================

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_DC.jpg/960px-White_House_DC.jpg'
WHERE name = 'The White House';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/National_Archives_Building_DC.jpg/960px-National_Archives_Building_DC.jpg'
WHERE name = 'National Archives Museum';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Arlington_National_Cemetery_aerial.jpg/960px-Arlington_National_Cemetery_aerial.jpg'
WHERE name = 'Arlington National Cemetery';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Capitol_west_side.JPG/960px-US_Capitol_west_side.JPG'
WHERE name = 'United States Capitol';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Thomas_Jefferson_Memorial_1.jpg/960px-Thomas_Jefferson_Memorial_1.jpg'
WHERE name = 'Thomas Jefferson Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Lincoln_Memorial_NPS.jpg/960px-Lincoln_Memorial_NPS.jpg'
WHERE name = 'Lincoln Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Washington_Monument_Dusk_Jan_2006.jpg/960px-Washington_Monument_Dusk_Jan_2006.jpg'
WHERE name = 'Washington Monument';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Vietnam_Wall_Reflections.jpg/960px-Vietnam_Wall_Reflections.jpg'
WHERE name = 'Vietnam Veterans Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Korean_War_Veterans_Memorial.jpg/960px-Korean_War_Veterans_Memorial.jpg'
WHERE name = 'Korean War Veterans Memorial';


-- ============================================================
-- UPDATE image_url for new inserts (match by name)
-- ============================================================

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Martin_Luther_King_Jr_Memorial_Stone_of_Hope.jpg/960px-Martin_Luther_King_Jr_Memorial_Stone_of_Hope.jpg'
WHERE name = 'Martin Luther King Jr. Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MLK_Birth_Home.jpg/960px-MLK_Birth_Home.jpg'
WHERE name = 'Martin Luther King Jr. National Historical Park';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Mount_Rushmore_14mb.jpg/960px-Mount_Rushmore_14mb.jpg'
WHERE name = 'Mount Rushmore National Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/FDR_Memorial_Washington_DC.jpg/960px-FDR_Memorial_Washington_DC.jpg'
WHERE name = 'Franklin Delano Roosevelt Memorial';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Dealey_Plaza_2014.jpg/960px-Dealey_Plaza_2014.jpg'
WHERE name = 'The Sixth Floor Museum at Dealey Plaza';

UPDATE presidential_locations SET image_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Eisenhower_farm_house.jpg/960px-Eisenhower_farm_house.jpg'
WHERE name = 'Eisenhower National Historic Site';


-- ============================================================
-- UPDATE year_established for all tier 2 existing locations
-- ============================================================

UPDATE presidential_locations SET year_established = 1853 WHERE name = 'George Washington''s Mount Vernon';
UPDATE presidential_locations SET year_established = 1946 WHERE name = 'Adams National Historical Park';
UPDATE presidential_locations SET year_established = 1923 WHERE name = 'Monticello — Home of Thomas Jefferson';
UPDATE presidential_locations SET year_established = 1889 WHERE name = 'The Hermitage — Home of President Andrew Jackson';
UPDATE presidential_locations SET year_established = 1971 WHERE name = 'Lincoln Home National Historic Site';
UPDATE presidential_locations SET year_established = 2005 WHERE name = 'Abraham Lincoln Presidential Library and Museum';
UPDATE presidential_locations SET year_established = 1968 WHERE name = 'Ford''s Theatre National Historic Site';
UPDATE presidential_locations SET year_established = 1895 WHERE name = 'Gettysburg National Military Park';
UPDATE presidential_locations SET year_established = 1963 WHERE name = 'Sagamore Hill National Historic Site';
UPDATE presidential_locations SET year_established = 1923 WHERE name = 'Theodore Roosevelt Birthplace National Historic Site';
UPDATE presidential_locations SET year_established = 1964 WHERE name = 'Woodrow Wilson House';
UPDATE presidential_locations SET year_established = 1948 WHERE name = 'FDR''s Little White House State Historic Site';
UPDATE presidential_locations SET year_established = 1969 WHERE name = 'John Fitzgerald Kennedy National Historic Site';
UPDATE presidential_locations SET year_established = 1969 WHERE name = 'Lyndon B. Johnson National Historical Park — LBJ Ranch';
UPDATE presidential_locations SET year_established = 1990 WHERE name = 'Richard Nixon Birthplace';
UPDATE presidential_locations SET year_established = 1998 WHERE name = 'Rancho del Cielo — Reagan Ranch';
UPDATE presidential_locations SET year_established = 1987 WHERE name = 'Jimmy Carter National Historical Park';


-- ============================================================
-- UPDATE year_established for existing tier 3 locations
-- ============================================================

UPDATE presidential_locations SET year_established = 1800 WHERE name = 'The White House';
UPDATE presidential_locations SET year_established = 1934 WHERE name = 'National Archives Museum';
UPDATE presidential_locations SET year_established = 1864 WHERE name = 'Arlington National Cemetery';
UPDATE presidential_locations SET year_established = 1800 WHERE name = 'United States Capitol';
UPDATE presidential_locations SET year_established = 1943 WHERE name = 'Thomas Jefferson Memorial';
UPDATE presidential_locations SET year_established = 1922 WHERE name = 'Lincoln Memorial';
UPDATE presidential_locations SET year_established = 1885 WHERE name = 'Washington Monument';
UPDATE presidential_locations SET year_established = 1982 WHERE name = 'Vietnam Veterans Memorial';
UPDATE presidential_locations SET year_established = 1995 WHERE name = 'Korean War Veterans Memorial';
