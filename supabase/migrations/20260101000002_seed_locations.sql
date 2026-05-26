-- ============================================================
-- TIER 1 — NARA Presidential Libraries (15 locations)
-- ============================================================

INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, collection_size, annual_visitors, year_opened, is_active)
VALUES

-- 1. Herbert Hoover Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 31),
  'Herbert Hoover Presidential Library and Museum',
  'nara_library', 1,
  '210 Parkside Drive', 'West Branch', 'IA',
  41.6736, -91.3465,
  'Located in Hoover''s birthplace, the library preserves records of America''s 31st president and his role in humanitarian relief and public service.',
  'Daily 9am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $10; Seniors $8; Ages 15 and under free',
  'https://www.hoover.archives.gov',
  ARRAY['Great Depression artifacts','Hoover humanitarian relief records','Fishing collection','Lou Henry Hoover papers'],
  10000000, 60000, 1962, true
),

-- 2. Franklin D. Roosevelt Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 32),
  'Franklin D. Roosevelt Presidential Library and Museum',
  'nara_library', 1,
  '4079 Albany Post Road', 'Hyde Park', 'NY',
  41.7739, -73.9349,
  'The nation''s first presidential library, opened in 1941, preserves FDR''s legacy through the New Deal and World War II.',
  'Daily 9am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $24; Seniors $20; Ages 15 and under free',
  'https://www.fdrlibrary.org',
  ARRAY['FDR''s 1936 Ford Phaeton','Eleanor Roosevelt gallery','New Deal artifacts','WWII map room replica','Hyde Park estate grounds'],
  22000000, 100000, 1941, true
),

-- 3. Harry S. Truman Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 33),
  'Harry S. Truman Presidential Library and Museum',
  'nara_library', 1,
  '500 West US Highway 24', 'Independence', 'MO',
  39.1034, -94.4208,
  'Truman''s library explores his rise from Missouri farm boy to president who ended WWII and established the postwar world order.',
  'Tue–Sat 9am–5pm; closed Sun, Mon, and federal holidays',
  'Adults $12; Seniors $9; Ages 15 and under free',
  'https://www.trumanlibrary.gov',
  ARRAY['Oval Office replica','Decision to drop the atomic bomb','Cold War origins','Korean War gallery','Truman''s personal correspondence'],
  13000000, 75000, 1957, true
),

-- 4. Dwight D. Eisenhower Presidential Library, Museum and Boyhood Home
(
  (SELECT id FROM presidents WHERE number = 34),
  'Dwight D. Eisenhower Presidential Library, Museum and Boyhood Home',
  'nara_library', 1,
  '200 Southeast 4th Street', 'Abilene', 'KS',
  38.9161, -97.2130,
  'Set on a 22-acre campus in Eisenhower''s hometown, the complex includes the library, museum, boyhood home, and place of meditation.',
  'Daily 9am–4:45pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $15; Seniors $12; Ages 7 and under free',
  'https://www.eisenhower.archives.gov',
  ARRAY['D-Day planning artifacts','Cold War nuclear strategy','NATO founding documents','Ike''s boyhood home','Korean War armistice materials'],
  12000000, 90000, 1954, true
),

-- 5. John F. Kennedy Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 35),
  'John F. Kennedy Presidential Library and Museum',
  'nara_library', 1,
  'Columbia Point', 'Boston', 'MA',
  42.3175, -71.0362,
  'Designed by I.M. Pei, the Kennedy Library stands on Boston Harbor and captures the spirit of Camelot and the challenges of the 1960s.',
  'Daily 9am–5pm; last entry 3:30pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $22; Seniors $18; Ages 12 and under free',
  'https://www.jfklibrary.org',
  ARRAY['Oval Office exhibit','Space race gallery','Cuban Missile Crisis archives','Jackie Kennedy''s wardrobe','JFK''s sailboat Victura'],
  9000000, 200000, 1979, true
),

-- 6. Lyndon Baines Johnson Presidential Library
(
  (SELECT id FROM presidents WHERE number = 36),
  'Lyndon Baines Johnson Presidential Library',
  'nara_library', 1,
  '2313 Red River Street', 'Austin', 'TX',
  30.2862, -97.7356,
  'On the University of Texas campus, the LBJ Library houses 45 million pages of historical documents spanning four decades of American political history.',
  'Daily 9am–5pm; closed Christmas Day',
  'Free admission',
  'https://www.lbjlibrary.org',
  ARRAY['Civil Rights Act artifacts','Great Society legislation','Vietnam War gallery','Animatronic LBJ exhibit','Nixon Watergate tapes (on loan)'],
  45000000, 250000, 1971, true
),

-- 7. Richard Nixon Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 37),
  'Richard Nixon Presidential Library and Museum',
  'nara_library', 1,
  '18001 Yorba Linda Boulevard', 'Yorba Linda', 'CA',
  33.8886, -117.8131,
  'Nixon''s birthplace and final resting place, the library covers his extraordinary career from Cold War diplomat to Watergate resignation.',
  'Mon–Sat 10am–5pm; Sun 11am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $22; Seniors $15; Ages 11 and under free',
  'https://www.nixonlibrary.gov',
  ARRAY['Watergate gallery','Nixon''s 1969 Lincoln Continental','China opening diplomatic records','Pat Nixon rose garden','The White House East Room replica'],
  30000000, 80000, 1990, true
),

-- 8. Gerald R. Ford Presidential Library
(
  (SELECT id FROM presidents WHERE number = 38),
  'Gerald R. Ford Presidential Museum',
  'nara_library', 1,
  '303 Pearl Street Northwest', 'Grand Rapids', 'MI',
  42.9712, -85.6727,
  'Located in Ford''s hometown, the museum tells the story of America''s only unelected president who helped heal a divided nation after Watergate.',
  'Mon–Sat 9am–5pm; Sun 12–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $14; Seniors $11; Ages 12 and under free',
  'https://www.fordlibrarymuseum.gov',
  ARRAY['Oval Office replica','Nixon pardon documents','Helsinki Accords','Vietnam fall of Saigon gallery','Betty Ford exhibit'],
  25000000, 100000, 1981, true
),

-- 9. Jimmy Carter Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 39),
  'Jimmy Carter Presidential Library and Museum',
  'nara_library', 1,
  '441 Freedom Parkway Northeast', 'Atlanta', 'GA',
  33.7700, -84.3680,
  'The Carter Library documents his four years in office and his ongoing humanitarian work, including the Carter Center''s global peace initiatives.',
  'Mon–Sat 9am–4:45pm; Sun 12–4:45pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $12; Seniors $9; Ages 16 and under free',
  'https://www.jimmycarterlibrary.gov',
  ARRAY['Camp David Accords artifacts','Iran hostage crisis materials','Energy crisis gallery','Carter Center peace mission archives','Oval Office replica'],
  27000000, 75000, 1986, true
),

-- 10. Ronald Reagan Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 40),
  'Ronald Reagan Presidential Library and Museum',
  'nara_library', 1,
  '40 Presidential Drive', 'Simi Valley', 'CA',
  34.2581, -118.8292,
  'Perched in the hills above Simi Valley, the Reagan Library houses Air Force One, a piece of the Berlin Wall, and chronicles the end of the Cold War.',
  'Daily 10am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $30; Seniors $25; Ages 11 and under free',
  'https://www.reaganlibrary.gov',
  ARRAY['Air Force One pavilion','Berlin Wall section','Cold War''s end gallery','Space Shuttle Enterprise','Reagan''s California ranch replica'],
  55000000, 400000, 1991, true
),

-- 11. George H.W. Bush Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 41),
  'George H.W. Bush Presidential Library and Museum',
  'nara_library', 1,
  '1000 George Bush Drive West', 'College Station', 'TX',
  30.6008, -96.3393,
  'On the Texas A&M campus, Bush 41''s library chronicles the fall of the Berlin Wall, Gulf War, and the extraordinary diplomacy of the post-Cold War era.',
  'Mon–Sat 9:30am–5pm; Sun 12–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $9; Seniors $7; Ages 16 and under free',
  'https://www.bush41.org',
  ARRAY['Berlin Wall fragment','Gulf War gallery','Driving (Bush''s cigarette boat)','Cold War''s end artifacts','China diplomatic mission records'],
  38000000, 100000, 1997, true
),

-- 12. William J. Clinton Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 42),
  'William J. Clinton Presidential Library and Museum',
  'nara_library', 1,
  '1200 President Clinton Avenue', 'Little Rock', 'AR',
  34.7480, -92.2659,
  'The Clinton Library''s glass-and-steel bridge design symbolizes building to the future. It houses records of the longest peacetime economic expansion in US history.',
  'Mon–Sat 9am–5pm; Sun 1–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $10; Seniors $8; Ages 5 and under free',
  'https://www.clintonlibrary.gov',
  ARRAY['Full-scale Oval Office replica','1990s economic boom gallery','Impeachment trial materials','Camp David Middle East peace summit','Hillary Clinton exhibit'],
  80000000, 150000, 2004, true
),

-- 13. George W. Bush Presidential Library and Museum
(
  (SELECT id FROM presidents WHERE number = 43),
  'George W. Bush Presidential Library and Museum',
  'nara_library', 1,
  '2943 SMU Boulevard', 'Dallas', 'TX',
  32.8412, -96.7832,
  'On the SMU campus, the Bush 43 Library uses interactive decision points to explore the September 11 response, Afghanistan, Iraq, and Hurricane Katrina.',
  'Mon–Sat 9am–5pm; Sun 12–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $24; Seniors $20; Ages 13 and under free',
  'https://www.georgewbushlibrary.smu.edu',
  ARRAY['9/11 artifacts and steel beam','Freedom Hall','Hurricane Katrina response gallery','Bush''s oil painting studio','Air Force One model'],
  70000000, 300000, 2013, true
),

-- 14. Barack Obama Presidential Library (Chicago)
(
  (SELECT id FROM presidents WHERE number = 44),
  'Obama Presidential Center',
  'nara_library', 1,
  '5200 South Cornell Avenue', 'Chicago', 'IL',
  41.7940, -87.5804,
  'Located in Chicago''s South Side Jackson Park, the Obama Presidential Center celebrates the 44th president''s historic presidency and community legacy.',
  'Daily 10am–5pm (check website for current hours)',
  'Adults $30; Seniors $25; Youth 13–18 $15; Ages 12 and under free',
  'https://www.obama.org/center',
  ARRAY['Affordable Care Act gallery','2008 campaign trail artifacts','Obama family White House life','Community organizing exhibit','Nobel Peace Prize display'],
  30000000, 500000, 2025, true
),

-- 15. Theodore Roosevelt Presidential Library (Medora, ND)
(
  (SELECT id FROM presidents WHERE number = 26),
  'Theodore Roosevelt Presidential Library',
  'nara_library', 1,
  '315 2nd Avenue', 'Medora', 'ND',
  46.9181, -103.5257,
  'Nestled in the badlands where TR''s conservation philosophy was born, this library connects visitors to the wild landscapes that shaped America''s great conservationist.',
  'Daily 9am–5pm (Memorial Day–Labor Day); reduced hours off-season',
  'Adults $28; Seniors $22; Ages 12 and under free',
  'https://www.trpresidentiallibrary.org',
  ARRAY['Badlands conservation origins','Rough Riders artifacts','National Park founding documents','TR''s Elkhorn Ranch replica','Big Stick diplomacy gallery'],
  0, 200000, 2026, true
);


-- ============================================================
-- TIER 2 — Historic Presidential Sites (17 locations)
-- ============================================================

INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, is_active)
VALUES

-- Mount Vernon (Washington)
(
  (SELECT id FROM presidents WHERE number = 1),
  'George Washington''s Mount Vernon',
  'home', 2,
  '3200 Mount Vernon Memorial Highway', 'Mount Vernon', 'VA',
  38.7079, -77.0860,
  'Washington''s beloved 8,000-acre plantation on the Potomac River, where he lived for most of his adult life. The mansion, gardens, and tomb offer an intimate view of the Founding Father.',
  'Daily 9am–5pm (April–Oct); 9am–4pm (Nov–Mar); open 365 days',
  'Adults $30; Seniors $29; Ages 5–11 $18; Ages 4 and under free',
  'https://www.mountvernon.org',
  ARRAY['Mansion house tour','Washington family tomb','Pioneer farm','Donald W. Reynolds Museum','Pioneer distillery'],
  true
),

-- Adams NHP (John Adams + John Quincy Adams)
(
  (SELECT id FROM presidents WHERE number = 2),
  'Adams National Historical Park',
  'home', 2,
  '1250 Hancock Street', 'Quincy', 'MA',
  42.2540, -71.0074,
  'Home to two presidents and four generations of the Adams family, including John Adams and John Quincy Adams. The Old House, birthplaces, and United First Parish Church form a remarkable presidential compound.',
  'Mid-Apr–mid-Nov: Daily 9am–5pm; closed rest of year',
  'Adults $20; Ages 15 and under free (NPS fee)',
  'https://www.nps.gov/adam',
  ARRAY['John Adams birthplace','John Quincy Adams birthplace','Peacefield (Old House)','Stone Library with 14,000 volumes','Adams family church and tombs'],
  true
),

-- Monticello (Jefferson)
(
  (SELECT id FROM presidents WHERE number = 3),
  'Monticello — Home of Thomas Jefferson',
  'home', 2,
  '931 Thomas Jefferson Parkway', 'Charlottesville', 'VA',
  38.0088, -78.4538,
  'Jefferson''s architectural masterpiece atop his "little mountain" in the Virginia Piedmont. The plantation home is a UNESCO World Heritage Site reflecting Jefferson''s genius and the complexity of his legacy.',
  'Daily 10am–5pm; closed Christmas Day',
  'Adults $32; Seniors $30; Ages 6–11 $18; Ages 5 and under free',
  'https://home.monticello.org',
  ARRAY['Jefferson''s architectural innovations','Mulberry Row enslaved community site','Jefferson''s personal library','Getting Word oral history project','Guided mansion tours'],
  true
),

-- The Hermitage (Jackson)
(
  (SELECT id FROM presidents WHERE number = 7),
  'The Hermitage — Home of President Andrew Jackson',
  'home', 2,
  '4580 Rachel''s Lane', 'Nashville', 'TN',
  36.2200, -86.6100,
  'Jackson''s Greek Revival plantation home on 1,120 acres outside Nashville, where Old Hickory returned after two turbulent presidential terms.',
  'Daily 9am–5pm; closed Thanksgiving and Christmas',
  'Adults $24; Seniors $22; Ages 6–12 $13; Ages 5 and under free',
  'https://www.thehermitage.com',
  ARRAY['Mansion house with original furnishings','Jackson''s tomb','Enslaved community archaeological site','First Federal Style kitchen','Battle of New Orleans artifacts'],
  true
),

-- Lincoln Home (Lincoln)
(
  (SELECT id FROM presidents WHERE number = 16),
  'Lincoln Home National Historic Site',
  'home', 2,
  '413 South 8th Street', 'Springfield', 'IL',
  39.7990, -89.6454,
  'The only home Abraham Lincoln ever owned, where he lived from 1844 until leaving for Washington in 1861. The surrounding four-block neighborhood has been restored to its 1860s appearance.',
  'Daily 9am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Free admission (timed entry tickets required)',
  'https://www.nps.gov/liho',
  ARRAY['Lincoln family home tour','1860 neighborhood restoration','Lincoln farewell address site','Neighboring historic homes','Lincoln''s personal belongings'],
  true
),

-- Abraham Lincoln Presidential Library (Springfield, IL)
(
  (SELECT id FROM presidents WHERE number = 16),
  'Abraham Lincoln Presidential Library and Museum',
  'nara_library', 2,
  '212 North 6th Street', 'Springfield', 'IL',
  39.8019, -89.6474,
  'Illinois''s state-run presidential library and museum (not NARA), featuring special effects, theatrical presentations, and the nation''s largest collection of Lincoln artifacts.',
  'Daily 9am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Adults $15; Seniors $12; Ages 4–15 $6; Ages 3 and under free',
  'https://www.alplm.org',
  ARRAY['Ghosts of the Library theatrical experience','Union Theater film','Lincoln family life exhibits','Original Emancipation Proclamation drafts','Civil War battlefield artifacts'],
  true
),

-- Ford's Theatre (Lincoln assassination)
(
  (SELECT id FROM presidents WHERE number = 16),
  'Ford''s Theatre National Historic Site',
  'historic_site', 2,
  '511 10th Street Northwest', 'Washington', 'DC',
  38.8965, -77.0264,
  'The theater where President Lincoln was shot on April 14, 1865, and the Petersen House across the street where he died. A still-active performing arts venue with a presidential museum below.',
  'Daily 9am–4:30pm; museum free; theater tours ticketed',
  'Museum free; Theater tour $3.50',
  'https://www.nps.gov/foth',
  ARRAY['Presidential Box where Lincoln sat','Derringer pistol used by Booth','Petersen House deathbed','Museum on Lincoln assassination','Active 664-seat theater'],
  true
),

-- Gettysburg (Lincoln — battlefield + address site)
(
  (SELECT id FROM presidents WHERE number = 16),
  'Gettysburg National Military Park',
  'historic_site', 2,
  '1195 Baltimore Pike', 'Gettysburg', 'PA',
  39.8026, -77.2345,
  'Site of the Civil War''s bloodiest battle and Lincoln''s Gettysburg Address, delivered at the dedication of the soldiers'' cemetery on November 19, 1863.',
  'Daily 6am–10pm (grounds); Visitor Center 8am–5pm; closed Christmas',
  'Grounds free; Museum Adults $15; Seniors $13; Ages 6–12 $10',
  'https://www.nps.gov/gett',
  ARRAY['Gettysburg Address memorial','Cyclorama painting','High Water Mark monument','Cemetery Hill overlook','Battlefield auto tour'],
  true
),

-- Sagamore Hill (Theodore Roosevelt)
(
  (SELECT id FROM presidents WHERE number = 26),
  'Sagamore Hill National Historic Site',
  'home', 2,
  '20 Sagamore Hill Road', 'Oyster Bay', 'NY',
  40.8899, -73.5077,
  'TR''s "Summer White House" on Long Island Sound, where he raised his six children and retreated between the rigors of public life. The rambling Victorian home reflects his exuberant personality.',
  'Wed–Sun 10am–4pm (tours hourly); closed Mon, Tue, and federal holidays',
  'Adults $10; Ages 15 and under free',
  'https://www.nps.gov/sahi',
  ARRAY['Trophy room with hunting trophies','TR''s personal library of 500 books','Original family furnishings','North Room Victorian great hall','Roosevelt family gravesite nearby'],
  true
),

-- TR Birthplace (Theodore Roosevelt)
(
  (SELECT id FROM presidents WHERE number = 26),
  'Theodore Roosevelt Birthplace National Historic Site',
  'birthplace', 2,
  '28 East 20th Street', 'New York', 'NY',
  40.7390, -73.9889,
  'A brownstone reconstruction of the Manhattan rowhouse where TR was born in 1858. Five rooms are furnished to reflect the 1860s Roosevelt household where the future president spent his childhood.',
  'Tue–Sat 9am–5pm; closed Sun, Mon, and federal holidays',
  'Adults $10; Ages 15 and under free',
  'https://www.nps.gov/thrb',
  ARRAY['Period-furnished Victorian rooms','TR''s childhood memorabilia','Medal of Honor display','Victorian parlor and library','Family photographs and personal items'],
  true
),

-- Woodrow Wilson House (Wilson)
(
  (SELECT id FROM presidents WHERE number = 28),
  'Woodrow Wilson House',
  'home', 2,
  '2340 S Street Northwest', 'Washington', 'DC',
  38.9142, -77.0531,
  'The Georgian Revival townhouse where Wilson retired after his presidency, and where he died in 1924. The only former presidential residence open to the public in Washington, DC.',
  'Wed–Sun 10am–4pm; closed Mon, Tue, and major holidays',
  'Adults $15; Seniors $12; Students $8; Ages 7 and under free',
  'https://www.woodrowwilsonhouse.org',
  ARRAY['League of Nations artifacts','Post-presidential living quarters','Wilson''s private library','Edith Wilson''s role in governance','Peace treaty negotiations memorabilia'],
  true
),

-- FDR Little White House (FDR — Warm Springs)
(
  (SELECT id FROM presidents WHERE number = 32),
  'FDR''s Little White House State Historic Site',
  'home', 2,
  '401 Little White House Road', 'Warm Springs', 'GA',
  32.8882, -84.6808,
  'The modest cottage where FDR found relief from polio and where he died on April 12, 1945, while sitting for a portrait. The unfinished portrait still hangs on the wall.',
  'Daily 9am–4:45pm; closed Thanksgiving and Christmas',
  'Adults $12; Seniors $10; Ages 6–12 $8; Ages 5 and under free',
  'https://www.gastateparks.org/FDRsLittleWhiteHouse',
  ARRAY['Unfinished portrait of FDR','Original cottage furnishings','1938 Ford Phaeton','Polio rehabilitation history','Pool and therapy facilities'],
  true
),

-- JFK Birthplace (Kennedy)
(
  (SELECT id FROM presidents WHERE number = 35),
  'John Fitzgerald Kennedy National Historic Site',
  'birthplace', 2,
  '83 Beals Street', 'Brookline', 'MA',
  42.3392, -71.1287,
  'The modest colonial revival house where JFK was born on May 29, 1917. Rose Kennedy helped restore the home to its 1917 appearance and recorded audio descriptions for visitors.',
  'Wed–Sun 10am–4pm (May–Oct); closed rest of year',
  'Adults $7; Ages 15 and under free',
  'https://www.nps.gov/jofi',
  ARRAY['Kennedy family birthplace rooms','Rose Kennedy audio tour','Kennedy family photographs','Period furnishings from 1917','Kennedy family neighborhood walk'],
  true
),

-- LBJ Ranch (Johnson — Stonewall, TX)
(
  (SELECT id FROM presidents WHERE number = 36),
  'Lyndon B. Johnson National Historical Park — LBJ Ranch',
  'home', 2,
  '199 State Park Road 52', 'Stonewall', 'TX',
  30.2440, -98.6263,
  'LBJ''s beloved Texas Hill Country ranch, the "Texas White House," where he conducted affairs of state, hosted heads of government, and returned to die in 1973.',
  'Daily 8:30am–4:30pm; closed Christmas',
  'Free admission (self-guided driving tour)',
  'https://www.nps.gov/lyjo',
  ARRAY['Texas White House Ranch tour','LBJ birthplace cabin','LBJ grave site','Reconstructed one-room schoolhouse','Longhorn cattle herd'],
  true
),

-- Nixon Birthplace (Nixon — Yorba Linda)
(
  (SELECT id FROM presidents WHERE number = 37),
  'Richard Nixon Birthplace',
  'birthplace', 2,
  '18001 Yorba Linda Boulevard', 'Yorba Linda', 'CA',
  33.8889, -117.8138,
  'The modest farmhouse built by Nixon''s father Frank, where Richard Nixon was born January 9, 1913. Now part of the Nixon Presidential Library complex.',
  'Mon–Sat 10am–5pm; Sun 11am–5pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Included with Nixon Library admission (Adults $22)',
  'https://www.nixonlibrary.gov',
  ARRAY['Nixon family birthplace farmhouse','Period furnishings from 1913','Nixon childhood memorabilia','Family citrus grove context','Connection to Nixon Library main exhibit'],
  true
),

-- Reagan Ranch (Reagan — near Santa Barbara)
(
  (SELECT id FROM presidents WHERE number = 40),
  'Rancho del Cielo — Reagan Ranch',
  'home', 2,
  'Refugio Road', 'Santa Barbara', 'CA',
  34.5667, -119.9833,
  'Reagan''s 688-acre mountain retreat above Santa Barbara, the "Western White House," where he hosted Mikhail Gorbachev and spent more than a year of his presidency. Now preserved by the Young America''s Foundation.',
  'Tours by appointment only',
  'Contact Young America''s Foundation for tour information',
  'https://www.reaganranch.org',
  ARRAY['Reagan''s personal tack room','Rustic ranch home furnishings','Riding trails Reagan used','Pacific Ocean views from hilltop','Cold War summit hosting site'],
  true
),

-- Carter Plains (Carter — Plains, GA)
(
  (SELECT id FROM presidents WHERE number = 39),
  'Jimmy Carter National Historical Park',
  'historic_site', 2,
  '300 North Bond Street', 'Plains', 'GA',
  32.0340, -84.3937,
  'The small Georgia town that shaped Jimmy Carter, encompassing his boyhood farm, high school, campaign headquarters, and the home he still occupies today.',
  'Daily 9am–4:30pm; closed Thanksgiving, Christmas, New Year''s Day',
  'Free admission',
  'https://www.nps.gov/jica',
  ARRAY['Carter Boyhood Farm at Archery','Plains High School museum','Campaign headquarters (1976)','Carter family church','Maranatha Baptist Church where Carter taught Sunday school'],
  true
);


-- ============================================================
-- TIER 3 — Presidential Experiences (9 DC & national sites)
-- ============================================================

INSERT INTO presidential_locations
  (president_id, name, location_type, tier, address, city, state,
   latitude, longitude, description, hours, admission,
   website_url, signature_exhibits, is_active)
VALUES

-- The White House
(
  NULL,
  'The White House',
  'experience', 3,
  '1600 Pennsylvania Avenue Northwest', 'Washington', 'DC',
  38.8977, -77.0366,
  'The official residence and principal workplace of every US president since John Adams in 1800. Public tours available through congressional representatives; exterior viewable year-round.',
  'Tours Tue–Sat 8am–12:30pm (advance reservation required via congressional office)',
  'Free (requires advance reservation through your Member of Congress)',
  'https://www.whitehouse.gov/about-the-white-house/the-grounds',
  ARRAY['State Dining Room','Blue Room','Oval Office (exterior view)','Rose Garden','Presidential portraits gallery'],
  true
),

-- National Archives
(
  NULL,
  'National Archives Museum',
  'experience', 3,
  '701 Constitution Avenue Northwest', 'Washington', 'DC',
  38.8935, -77.0268,
  'Home to America''s founding documents — the Declaration of Independence, Constitution, and Bill of Rights — displayed in the Rotunda for the Charters of Freedom.',
  'Daily 10am–5:30pm; closed Thanksgiving and Christmas',
  'Free admission',
  'https://www.archives.gov/museum',
  ARRAY['Declaration of Independence','US Constitution','Bill of Rights','Magna Carta (on loan periodically)','Presidential records exhibits'],
  true
),

-- Arlington National Cemetery
(
  NULL,
  'Arlington National Cemetery',
  'experience', 3,
  'Memorial Avenue', 'Arlington', 'VA',
  38.8772, -77.0707,
  'The nation''s most hallowed burial ground, resting place of President John F. Kennedy, the Unknown Soldier, and more than 400,000 veterans. The Changing of the Guard at the Tomb is performed every hour.',
  'Apr–Sep: Daily 8am–7pm; Oct–Mar: Daily 8am–5pm',
  'Free admission; Parking $3/hour',
  'https://www.arlingtoncemetery.mil',
  ARRAY['JFK eternal flame and gravesite','Tomb of the Unknown Soldier','Changing of the Guard ceremony','Robert E. Lee Memorial (Arlington House)','Memorial Amphitheater'],
  true
),

-- The Capitol Building
(
  NULL,
  'United States Capitol',
  'experience', 3,
  'East Capitol Street Northeast & First Street Southeast', 'Washington', 'DC',
  38.8899, -77.0091,
  'The seat of the US Congress and site of every presidential inauguration since 1789 (except Washington''s first). Tours of the Capitol Visitor Center are free but require advance reservations.',
  'Mon–Sat 8:30am–4:30pm; closed Sundays and federal holidays',
  'Free (advance reservation recommended through congressional office or CVC)',
  'https://www.visitthecapitol.gov',
  ARRAY['Rotunda with presidential history fresco','National Statuary Hall','Old Senate Chamber','Presidential inauguration steps','Crypt with Washington''s intended tomb'],
  true
),

-- Jefferson Memorial
(
  (SELECT id FROM presidents WHERE number = 3),
  'Thomas Jefferson Memorial',
  'monument', 3,
  '16 East Basin Drive Southwest', 'Washington', 'DC',
  38.8814, -77.0365,
  'A neoclassical memorial on the Tidal Basin inspired by Jefferson''s own architectural designs, housing a 19-foot bronze statue and inscriptions from his most celebrated writings.',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/thje',
  ARRAY['19-foot bronze Jefferson statue','Declaration of Independence inscriptions','View of Washington Monument and Tidal Basin','Cherry blossom backdrop (spring)','Jefferson''s writings on walls'],
  true
),

-- Lincoln Memorial
(
  (SELECT id FROM presidents WHERE number = 16),
  'Lincoln Memorial',
  'monument', 3,
  '2 Lincoln Memorial Circle Northwest', 'Washington', 'DC',
  38.8893, -77.0502,
  'The iconic Greek Doric temple housing Daniel Chester French''s colossal seated Lincoln, site of Martin Luther King Jr.''s "I Have a Dream" speech and countless historic gatherings.',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/linc',
  ARRAY['Seated Lincoln statue (19 feet)','Gettysburg Address inscription','Second Inaugural Address inscription','Steps where MLK delivered I Have a Dream','Reflecting Pool views'],
  true
),

-- Washington Monument
(
  (SELECT id FROM presidents WHERE number = 1),
  'Washington Monument',
  'monument', 3,
  '2 15th Street Northwest', 'Washington', 'DC',
  38.8895, -77.0353,
  'The world''s tallest stone structure at its completion in 1884, honoring the nation''s first president. The 555-foot obelisk offers 360-degree views of the capital from its observation level.',
  'Daily 9am–10pm; closed July 4th and December 25',
  'Free; timed entry passes required (same-day at monument or advance online)',
  'https://www.nps.gov/wamo',
  ARRAY['Observation deck panoramic views','Historic construction timeline exhibit','Commemorative stones from states and nations','Original capstone replica','East and West facades'],
  true
),

-- Vietnam Veterans Memorial
(
  NULL,
  'Vietnam Veterans Memorial',
  'monument', 3,
  '5 Henry Bacon Drive Northwest', 'Washington', 'DC',
  38.8913, -77.0477,
  'Maya Lin''s iconic black granite wall inscribed with 58,318 names of American service members who died in Vietnam, a profoundly moving testament to sacrifice and loss.',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/vive',
  ARRAY['The Wall with 58,318 names','Three Soldiers statue','Vietnam Women''s Memorial','Reflection in polished black granite','Name rubbing area'],
  true
),

-- Korean War Veterans Memorial
(
  NULL,
  'Korean War Veterans Memorial',
  'monument', 3,
  '900 Ohio Drive Southwest', 'Washington', 'DC',
  38.8875, -77.0479,
  'Nineteen stainless steel statues of soldiers on patrol, a reflective granite wall etched with 2,500 archival photographs, honoring the 5.8 million Americans who served in the "Forgotten War."',
  'Daily 24 hours (rangers on duty 9:30am–10pm)',
  'Free admission',
  'https://www.nps.gov/kowa',
  ARRAY['Nineteen steel soldier statues','Reflective granite mural wall','Pool of Remembrance','Freedom is Not Free inscription','Columumbarium Court of Honor'],
  true
);
