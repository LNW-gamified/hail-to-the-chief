-- 150 trivia questions — 10 per president for all 15 NARA library presidents
-- Presidents: TR(26), Hoover(31), FDR(32), Truman(33), Eisenhower(34),
--   Kennedy(35), LBJ(36), Nixon(37), Ford(38), Carter(39), Reagan(40),
--   Bush41(41), Clinton(42), Bush43(43), Obama(44)

-- ── Theodore Roosevelt (#26) ──────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 26),
 'How old was Theodore Roosevelt when he was sworn in as president, making him the youngest in US history?',
 '42',
 ARRAY['44', '40', '46'],
 'easy'),

((SELECT id FROM presidents WHERE number = 26),
 'What was the name of the volunteer cavalry regiment Roosevelt led during the Spanish-American War?',
 'The Rough Riders',
 ARRAY['The Iron Brigade', 'The Frontier Scouts', 'The Buffalo Soldiers'],
 'easy'),

((SELECT id FROM presidents WHERE number = 26),
 'Roosevelt won the 1906 Nobel Peace Prize for mediating the end of which conflict?',
 'The Russo-Japanese War',
 ARRAY['The Spanish-American War', 'The Boer War', 'The Philippine-American War'],
 'medium'),

((SELECT id FROM presidents WHERE number = 26),
 'What sweeping 1906 law regulating the purity of food and medicines did Roosevelt champion?',
 'The Pure Food and Drug Act',
 ARRAY['The Sherman Antitrust Act', 'The Federal Reserve Act', 'The Homestead Act'],
 'medium'),

((SELECT id FROM presidents WHERE number = 26),
 'What was the name of Roosevelt''s domestic reform program emphasizing fair treatment for workers and corporations?',
 'The Square Deal',
 ARRAY['The New Deal', 'The Fair Deal', 'The Great Society'],
 'medium'),

((SELECT id FROM presidents WHERE number = 26),
 'Which federal agency did Roosevelt establish in 1905 to manage the nation''s forest reserves?',
 'The US Forest Service',
 ARRAY['The National Park Service', 'The Bureau of Land Management', 'The Fish and Wildlife Service'],
 'medium'),

((SELECT id FROM presidents WHERE number = 26),
 'The "Teddy Bear" toy was inspired by a hunting trip where Roosevelt refused to shoot a bear. In what state did this happen?',
 'Mississippi',
 ARRAY['Montana', 'North Dakota', 'Colorado'],
 'medium'),

((SELECT id FROM presidents WHERE number = 26),
 'Who was Theodore Roosevelt''s Vice President during his full elected term (1905–1909)?',
 'Charles W. Fairbanks',
 ARRAY['Charles Curtis', 'William Howard Taft', 'Elihu Root'],
 'hard'),

((SELECT id FROM presidents WHERE number = 26),
 'An assassination attempt was made on Roosevelt in 1912 while he was campaigning. In what city did it occur?',
 'Milwaukee, Wisconsin',
 ARRAY['Chicago, Illinois', 'Boston, Massachusetts', 'Cleveland, Ohio'],
 'hard'),

((SELECT id FROM presidents WHERE number = 26),
 'What object in Roosevelt''s breast pocket helped slow the bullet in the 1912 assassination attempt?',
 'A 50-page speech manuscript',
 ARRAY['A metal flask', 'A leather-bound Bible', 'A steel money clip'],
 'hard');

-- ── Herbert Hoover (#31) ──────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 31),
 'What catastrophic economic event began during Herbert Hoover''s presidency?',
 'The Great Depression',
 ARRAY['The Panic of 1907', 'World War I', 'The Dust Bowl alone'],
 'easy'),

((SELECT id FROM presidents WHERE number = 31),
 'In what state was Herbert Hoover born?',
 'Iowa',
 ARRAY['California', 'Oregon', 'Missouri'],
 'easy'),

((SELECT id FROM presidents WHERE number = 31),
 'What tariff law did Hoover sign in 1930 that is widely blamed for deepening the Great Depression?',
 'The Smoot-Hawley Tariff Act',
 ARRAY['The Fordney-McCumber Act', 'The Revenue Act of 1932', 'The Sherman Tariff Act'],
 'medium'),

((SELECT id FROM presidents WHERE number = 31),
 'Before the presidency, Hoover organized large-scale food relief in Europe after WWI. Which country was he most associated with feeding?',
 'Belgium',
 ARRAY['France', 'Russia', 'Germany'],
 'medium'),

((SELECT id FROM presidents WHERE number = 31),
 'What name was given to the makeshift shanty camps of unemployed Americans that sprang up during the Depression?',
 'Hoovervilles',
 ARRAY['Depression Camps', 'Poverty Flats', 'Shanty Towns'],
 'medium'),

((SELECT id FROM presidents WHERE number = 31),
 'What was Hoover''s occupation before he entered public service?',
 'Mining engineer',
 ARRAY['Lawyer', 'Military officer', 'Banker'],
 'medium'),

((SELECT id FROM presidents WHERE number = 31),
 'Who was Herbert Hoover''s Vice President?',
 'Charles Curtis',
 ARRAY['John Nance Garner', 'Charles Dawes', 'Henry Wallace'],
 'medium'),

((SELECT id FROM presidents WHERE number = 31),
 'In 1932, WWI veterans marched on Washington demanding early payment of military bonuses. What were they called?',
 'The Bonus Army',
 ARRAY['The Veterans'' March', 'The Soldier Protest', 'The Washington Brigade'],
 'hard'),

((SELECT id FROM presidents WHERE number = 31),
 'What was Herbert Hoover''s middle name?',
 'Clark',
 ARRAY['William', 'James', 'Arthur'],
 'hard'),

((SELECT id FROM presidents WHERE number = 31),
 'Hoover outlived his presidency by 31 years, dying in 1964. He lived to what age?',
 '90',
 ARRAY['85', '88', '93'],
 'hard');

-- ── Franklin D. Roosevelt (#32) ───────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 32),
 'How many terms was Franklin D. Roosevelt elected to as president?',
 'Four',
 ARRAY['Two', 'Three', 'Five'],
 'easy'),

((SELECT id FROM presidents WHERE number = 32),
 'What was the name of FDR''s sweeping economic relief program designed to combat the Great Depression?',
 'The New Deal',
 ARRAY['The Square Deal', 'The Fair Deal', 'The Great Society'],
 'easy'),

((SELECT id FROM presidents WHERE number = 32),
 'What physical condition did FDR largely conceal from the American public?',
 'Paralysis from polio',
 ARRAY['Blindness in one eye', 'Severe arthritis', 'Deafness'],
 'easy'),

((SELECT id FROM presidents WHERE number = 32),
 'In his "Day of Infamy" speech on December 8, 1941, FDR asked Congress to declare war on which country?',
 'Japan',
 ARRAY['Germany', 'Italy', 'Germany and Japan simultaneously'],
 'medium'),

((SELECT id FROM presidents WHERE number = 32),
 'What executive order authorized the internment of Japanese Americans during World War II?',
 'Executive Order 9066',
 ARRAY['Executive Order 8802', 'Executive Order 9981', 'Executive Order 9102'],
 'medium'),

((SELECT id FROM presidents WHERE number = 32),
 'In what year was the Social Security Act, a cornerstone of the New Deal, signed into law?',
 '1935',
 ARRAY['1933', '1937', '1939'],
 'medium'),

((SELECT id FROM presidents WHERE number = 32),
 'FDR''s regular radio broadcasts to the American people were famously called what?',
 'Fireside Chats',
 ARRAY['Presidential Addresses', 'Sunday Talks', 'National Broadcasts'],
 'medium'),

((SELECT id FROM presidents WHERE number = 32),
 'FDR died in office on April 12, 1945. In which city was he at the time?',
 'Warm Springs, Georgia',
 ARRAY['Hyde Park, New York', 'Washington, D.C.', 'Bethesda, Maryland'],
 'hard'),

((SELECT id FROM presidents WHERE number = 32),
 'The February 1945 conference where FDR, Churchill, and Stalin planned the post-war world was held where?',
 'Yalta, Crimea',
 ARRAY['Tehran, Iran', 'Casablanca, Morocco', 'Potsdam, Germany'],
 'hard'),

((SELECT id FROM presidents WHERE number = 32),
 'FDR''s 1937 "court-packing" scheme proposed adding how many new justices to the Supreme Court?',
 'Six',
 ARRAY['Three', 'Four', 'Nine'],
 'hard');

-- ── Harry S. Truman (#33) ─────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 33),
 'Truman ordered the use of atomic bombs on Japan. Name one of the two cities that were targeted.',
 'Hiroshima (or Nagasaki)',
 ARRAY['Tokyo', 'Osaka', 'Kyoto'],
 'easy'),

((SELECT id FROM presidents WHERE number = 33),
 'What doctrine did Truman announce in 1947 to support nations resisting communist takeover?',
 'The Truman Doctrine',
 ARRAY['The Marshall Plan', 'The Monroe Doctrine', 'The Eisenhower Doctrine'],
 'easy'),

((SELECT id FROM presidents WHERE number = 33),
 'The "S" in Harry S. Truman''s name is unusual. What does it stand for?',
 'Nothing — it was a compromise between two grandfathers'' names',
 ARRAY['Solomon', 'Samuel', 'Stephen'],
 'medium'),

((SELECT id FROM presidents WHERE number = 33),
 'What executive order did Truman sign in 1948 that desegregated the United States military?',
 'Executive Order 9981',
 ARRAY['Executive Order 9066', 'Executive Order 8802', 'Executive Order 9835'],
 'medium'),

((SELECT id FROM presidents WHERE number = 33),
 'Who was Truman''s Vice President during his elected term (1949–1953)?',
 'Alben W. Barkley',
 ARRAY['Henry Wallace', 'James F. Byrnes', 'Tom Connally'],
 'medium'),

((SELECT id FROM presidents WHERE number = 33),
 'Where was the Japanese surrender ceremony that formally ended World War II held?',
 'Aboard the USS Missouri in Tokyo Bay',
 ARRAY['Pearl Harbor, Hawaii', 'Manila Bay, Philippines', 'Washington, D.C.'],
 'medium'),

((SELECT id FROM presidents WHERE number = 33),
 'What did the famous incorrect Chicago Tribune headline the morning after the 1948 election read?',
 '"Dewey Defeats Truman"',
 ARRAY['"Truman Falls Short"', '"Republican Landslide: Dewey Wins"', '"Truman Loses in Upset"'],
 'medium'),

((SELECT id FROM presidents WHERE number = 33),
 'An assassination attempt on President Truman in 1950 took place at which official residence?',
 'Blair House',
 ARRAY['The White House', 'The Capitol', 'The Naval Observatory'],
 'hard'),

((SELECT id FROM presidents WHERE number = 33),
 'Truman fired General Douglas MacArthur during the Korean War. What was the primary reason?',
 'MacArthur publicly contradicted Truman''s authority and threatened unauthorized military escalation',
 ARRAY['MacArthur lost a critical battle', 'MacArthur secretly negotiated with the enemy', 'MacArthur requested early retirement'],
 'hard'),

((SELECT id FROM presidents WHERE number = 33),
 'The Marshall Plan, which Truman signed, provided economic aid to rebuild war-torn Europe. Approximately how much money was allocated?',
 '$13 billion',
 ARRAY['$1 billion', '$5 billion', '$50 billion'],
 'hard');

-- ── Dwight D. Eisenhower (#34) ────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 34),
 'Before becoming president, Eisenhower served as Supreme Commander of Allied Forces in which war?',
 'World War II',
 ARRAY['The Korean War', 'World War I', 'The Vietnam War'],
 'easy'),

((SELECT id FROM presidents WHERE number = 34),
 'What major domestic infrastructure program did Eisenhower sign into law in 1956?',
 'The Interstate Highway System',
 ARRAY['The National Railway Modernization Act', 'The Federal Airport Development Act', 'The Tennessee Valley Authority'],
 'easy'),

((SELECT id FROM presidents WHERE number = 34),
 'Eisenhower''s famous farewell address warned the nation about the dangers of what?',
 'The military-industrial complex',
 ARRAY['Communist infiltration', 'Nuclear proliferation', 'Unchecked federal debt'],
 'medium'),

((SELECT id FROM presidents WHERE number = 34),
 'Eisenhower sent federal troops to enforce school desegregation in which city in 1957?',
 'Little Rock, Arkansas',
 ARRAY['Montgomery, Alabama', 'Birmingham, Alabama', 'Nashville, Tennessee'],
 'medium'),

((SELECT id FROM presidents WHERE number = 34),
 'Who was Eisenhower''s Vice President?',
 'Richard Nixon',
 ARRAY['Adlai Stevenson', 'Earl Warren', 'William Knowland'],
 'medium'),

((SELECT id FROM presidents WHERE number = 34),
 'NASA was created during Eisenhower''s presidency largely in response to what Soviet achievement?',
 'The launch of Sputnik, the first artificial satellite',
 ARRAY['The Soviet atomic bomb test', 'The Berlin blockade', 'The Korean armistice'],
 'medium'),

((SELECT id FROM presidents WHERE number = 34),
 'Before running for president, Eisenhower served as president of which Ivy League university?',
 'Columbia University',
 ARRAY['Harvard University', 'Yale University', 'Princeton University'],
 'medium'),

((SELECT id FROM presidents WHERE number = 34),
 'In what year did Eisenhower give his farewell address warning about the military-industrial complex?',
 '1961',
 ARRAY['1958', '1960', '1963'],
 'hard'),

((SELECT id FROM presidents WHERE number = 34),
 'What Cold War spy incident embarrassed Eisenhower when an American reconnaissance plane was shot down over Soviet territory?',
 'The U-2 incident',
 ARRAY['The Bay of Pigs', 'Operation Paperclip', 'The Berlin Tunnel operation'],
 'hard'),

((SELECT id FROM presidents WHERE number = 34),
 'Eisenhower was born in Denison, Texas but is most associated with which Kansas city where he grew up?',
 'Abilene',
 ARRAY['Wichita', 'Lawrence', 'Topeka'],
 'hard');

-- ── John F. Kennedy (#35) ─────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 35),
 'In what year was President John F. Kennedy assassinated?',
 '1963',
 ARRAY['1961', '1965', '1964'],
 'easy'),

((SELECT id FROM presidents WHERE number = 35),
 'JFK was the first US president of which religious background?',
 'Roman Catholic',
 ARRAY['Episcopalian', 'Baptist', 'Quaker'],
 'easy'),

((SELECT id FROM presidents WHERE number = 35),
 'What 1962 standoff brought the US and Soviet Union to the brink of nuclear war?',
 'The Cuban Missile Crisis',
 ARRAY['The Bay of Pigs invasion', 'The Berlin Wall crisis', 'The Missile Gap controversy'],
 'easy'),

((SELECT id FROM presidents WHERE number = 35),
 'JFK established which civilian volunteer program in 1961 to send Americans to assist developing nations?',
 'The Peace Corps',
 ARRAY['VISTA', 'AmeriCorps', 'Food for Peace'],
 'medium'),

((SELECT id FROM presidents WHERE number = 35),
 'Who was JFK''s Vice President?',
 'Lyndon B. Johnson',
 ARRAY['Hubert Humphrey', 'Robert Kennedy', 'Stuart Symington'],
 'medium'),

((SELECT id FROM presidents WHERE number = 35),
 'The failed CIA-backed invasion of Cuba in April 1961 is known by what name?',
 'The Bay of Pigs invasion',
 ARRAY['Operation Mongoose', 'Operation Northwoods', 'The Dominican intervention'],
 'medium'),

((SELECT id FROM presidents WHERE number = 35),
 'JFK''s assassination took place in which city?',
 'Dallas, Texas',
 ARRAY['Houston, Texas', 'New Orleans, Louisiana', 'Chicago, Illinois'],
 'medium'),

((SELECT id FROM presidents WHERE number = 35),
 'In his famous Berlin speech, Kennedy declared "Ich bin ein Berliner." What does this translate to?',
 '"I am a Berliner"',
 ARRAY['"I am from the city of Berlin"', '"We are all Berliners"', '"Berlin shall be free"'],
 'medium'),

((SELECT id FROM presidents WHERE number = 35),
 'JFK served in the US Navy during WWII as commander of which torpedo boat?',
 'PT-109',
 ARRAY['PT-101', 'PT-115', 'PT-73'],
 'hard'),

((SELECT id FROM presidents WHERE number = 35),
 'Lee Harvey Oswald was arrested for Kennedy''s assassination but was killed two days later by whom?',
 'Jack Ruby',
 ARRAY['James Earl Ray', 'Sirhan Sirhan', 'Arthur Bremer'],
 'hard');

-- ── Lyndon B. Johnson (#36) ───────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 36),
 'What was the name of LBJ''s sweeping domestic policy agenda?',
 'The Great Society',
 ARRAY['The New Frontier', 'The New Deal', 'The Fair Deal'],
 'easy'),

((SELECT id FROM presidents WHERE number = 36),
 'LBJ signed the Civil Rights Act into law in what year?',
 '1964',
 ARRAY['1962', '1963', '1965'],
 'easy'),

((SELECT id FROM presidents WHERE number = 36),
 'Which landmark health insurance program for seniors was created by LBJ and signed into law in 1965?',
 'Medicare',
 ARRAY['Medicaid', 'Social Security', 'Veterans Health Administration'],
 'medium'),

((SELECT id FROM presidents WHERE number = 36),
 'What congressional resolution gave LBJ broad authority to escalate US military involvement in Vietnam?',
 'The Gulf of Tonkin Resolution',
 ARRAY['The War Powers Act', 'The SEATO Agreement', 'The Pacific Defense Resolution'],
 'medium'),

((SELECT id FROM presidents WHERE number = 36),
 'In what state was Lyndon B. Johnson born?',
 'Texas',
 ARRAY['Oklahoma', 'Arkansas', 'Louisiana'],
 'medium'),

((SELECT id FROM presidents WHERE number = 36),
 'Who was LBJ''s Vice President?',
 'Hubert Humphrey',
 ARRAY['Edmund Muskie', 'Walter Mondale', 'Eugene McCarthy'],
 'medium'),

((SELECT id FROM presidents WHERE number = 36),
 'LBJ was famously known for his aggressive personal persuasion tactics on fellow senators. What was this called?',
 'The Johnson Treatment',
 ARRAY['The Texas Squeeze', 'The Senate Game', 'The Floor Whip'],
 'medium'),

((SELECT id FROM presidents WHERE number = 36),
 'LBJ was sworn in as president aboard Air Force One. Who administered the oath of office?',
 'Federal Judge Sarah T. Hughes',
 ARRAY['Chief Justice Earl Warren', 'Speaker John McCormack', 'Attorney General Robert Kennedy'],
 'hard'),

((SELECT id FROM presidents WHERE number = 36),
 'The Voting Rights Act of 1965 was a landmark civil rights law. What practice did it specifically prohibit?',
 'Discriminatory voting practices such as literacy tests used to disenfranchise Black voters',
 ARRAY['Racial segregation in schools', 'Employment discrimination based on race', 'Housing discrimination'],
 'hard'),

((SELECT id FROM presidents WHERE number = 36),
 'In what specific Texas city was Lyndon B. Johnson born?',
 'Stonewall, Texas',
 ARRAY['Austin, Texas', 'San Antonio, Texas', 'Johnson City, Texas'],
 'hard');

-- ── Richard Nixon (#37) ───────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 37),
 'What scandal forced Richard Nixon to resign from the presidency?',
 'Watergate',
 ARRAY['Iran-Contra', 'Teapot Dome', 'The Lavender Scare'],
 'easy'),

((SELECT id FROM presidents WHERE number = 37),
 'Nixon was the first sitting US president to visit which country, opening diplomatic relations?',
 'China',
 ARRAY['The Soviet Union', 'Cuba', 'North Vietnam'],
 'easy'),

((SELECT id FROM presidents WHERE number = 37),
 'On what date did Nixon announce his resignation?',
 'August 8, 1974',
 ARRAY['June 17, 1974', 'July 27, 1974', 'September 1, 1974'],
 'medium'),

((SELECT id FROM presidents WHERE number = 37),
 'Who was serving as Nixon''s VP when he resigned, and subsequently became president?',
 'Gerald Ford',
 ARRAY['Spiro Agnew', 'Nelson Rockefeller', 'Ronald Reagan'],
 'medium'),

((SELECT id FROM presidents WHERE number = 37),
 'What was the name of Nixon''s strategy to gradually transfer military responsibility to South Vietnam?',
 'Vietnamization',
 ARRAY['The Nixon Doctrine', 'Operation Linebacker', 'Détente'],
 'medium'),

((SELECT id FROM presidents WHERE number = 37),
 'Nixon''s policy of easing Cold War tensions with the Soviet Union was known by what French term?',
 'Détente',
 ARRAY['Rapprochement', 'Realpolitik', 'Entente'],
 'medium'),

((SELECT id FROM presidents WHERE number = 37),
 'Which environmental regulatory agency did Nixon create in 1970?',
 'The Environmental Protection Agency (EPA)',
 ARRAY['The Department of Energy', 'The Clean Air Commission', 'The Council on Environmental Quality'],
 'medium'),

((SELECT id FROM presidents WHERE number = 37),
 'Nixon attended law school at which institution?',
 'Duke University',
 ARRAY['Harvard Law School', 'Yale Law School', 'UCLA School of Law'],
 'hard'),

((SELECT id FROM presidents WHERE number = 37),
 'What was the date of the Watergate break-in that triggered the scandal?',
 'June 17, 1972',
 ARRAY['July 4, 1972', 'November 2, 1972', 'March 23, 1973'],
 'hard'),

((SELECT id FROM presidents WHERE number = 37),
 'After losing the 1962 California governor''s race, Nixon famously told reporters they would not have him to "kick around." What office had he lost?',
 'Governor of California',
 ARRAY['US Senate seat from California', 'Mayor of Los Angeles', 'California Attorney General'],
 'hard');

-- ── Gerald Ford (#38) ─────────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 38),
 'Ford is the only person in US history to serve as both VP and president without being elected to either office. True or false?',
 'True',
 ARRAY['False', 'Partially true — he was elected VP', 'Partially true — he was elected president', 'False — he was elected VP by the Electoral College'],
 'easy'),

((SELECT id FROM presidents WHERE number = 38),
 'Ford is best known for his controversial decision to pardon which former president?',
 'Richard Nixon',
 ARRAY['Lyndon B. Johnson', 'Harry Truman', 'Spiro Agnew'],
 'easy'),

((SELECT id FROM presidents WHERE number = 38),
 'What was Gerald Ford''s birth name?',
 'Leslie Lynch King Jr.',
 ARRAY['Gerald Rudolph Ford Sr.', 'Gerald Lyndon Ford', 'Richard Ford Jr.'],
 'medium'),

((SELECT id FROM presidents WHERE number = 38),
 'Who was Gerald Ford''s VP?',
 'Nelson Rockefeller',
 ARRAY['Bob Dole', 'Ronald Reagan', 'Donald Rumsfeld'],
 'medium'),

((SELECT id FROM presidents WHERE number = 38),
 'Ford grew up and represented which state in Congress?',
 'Michigan',
 ARRAY['Nebraska', 'Ohio', 'Indiana'],
 'medium'),

((SELECT id FROM presidents WHERE number = 38),
 'Ford was an All-American football player in college. What position did he play?',
 'Center',
 ARRAY['Quarterback', 'Running back', 'Linebacker'],
 'medium'),

((SELECT id FROM presidents WHERE number = 38),
 'Two assassination attempts were made on Ford in September 1975, both in the same state. Which state?',
 'California',
 ARRAY['Washington D.C.', 'Illinois', 'New York'],
 'medium'),

((SELECT id FROM presidents WHERE number = 38),
 'Before becoming VP, what was Ford''s highest position in the House of Representatives?',
 'House Minority Leader',
 ARRAY['Speaker of the House', 'House Majority Leader', 'Chairman of the Appropriations Committee'],
 'hard'),

((SELECT id FROM presidents WHERE number = 38),
 'Before his political career, Ford briefly worked as a fashion model. On which magazine''s cover did he appear?',
 'Cosmopolitan',
 ARRAY['Life', 'Look', 'Time'],
 'hard'),

((SELECT id FROM presidents WHERE number = 38),
 'The Helsinki Accords, signed during Ford''s presidency, primarily addressed what issue?',
 'Human rights and security cooperation in Europe',
 ARRAY['Nuclear arms reduction', 'Trade normalization with China', 'Middle East peace framework'],
 'hard');

-- ── Jimmy Carter (#39) ────────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 39),
 'What agricultural product is Jimmy Carter most associated with from his pre-political background?',
 'Peanuts',
 ARRAY['Cotton', 'Tobacco', 'Soybeans'],
 'easy'),

((SELECT id FROM presidents WHERE number = 39),
 'Carter mediated which landmark 1978 peace agreement between Egypt and Israel?',
 'The Camp David Accords',
 ARRAY['The Oslo Accords', 'The Dayton Accords', 'The Abraham Accords'],
 'easy'),

((SELECT id FROM presidents WHERE number = 39),
 'In what state was Jimmy Carter born and raised?',
 'Georgia',
 ARRAY['Virginia', 'Arkansas', 'North Carolina'],
 'easy'),

((SELECT id FROM presidents WHERE number = 39),
 'What foreign policy crisis dominated the final year of Carter''s presidency?',
 'The Iran Hostage Crisis',
 ARRAY['The Soviet invasion of Afghanistan (though this also occurred)', 'The Nicaraguan revolution', 'The Panama Canal handover'],
 'medium'),

((SELECT id FROM presidents WHERE number = 39),
 'Who was Carter''s Vice President?',
 'Walter Mondale',
 ARRAY['Edmund Muskie', 'Birch Bayh', 'Fritz Hollings'],
 'medium'),

((SELECT id FROM presidents WHERE number = 39),
 'The Panama Canal Treaties that Carter signed in 1977 did what?',
 'Transferred control of the canal to Panama by 1999',
 ARRAY['Gave the US permanent rights to the canal zone', 'Built a second, larger canal', 'Opened the canal to Soviet shipping'],
 'medium'),

((SELECT id FROM presidents WHERE number = 39),
 'After the presidency, Carter has been globally recognized for his work building homes with which charitable organization?',
 'Habitat for Humanity',
 ARRAY['Doctors Without Borders', 'The Red Cross', 'UNICEF'],
 'medium'),

((SELECT id FROM presidents WHERE number = 39),
 'Carter boycotted the 1980 Summer Olympics in Moscow as a protest against what Soviet action?',
 'The Soviet invasion of Afghanistan',
 ARRAY['Nuclear testing in Siberia', 'Human rights abuses in the Soviet Union', 'The Iranian hostage crisis'],
 'hard'),

((SELECT id FROM presidents WHERE number = 39),
 'Carter served as a nuclear submarine officer under which demanding admiral?',
 'Admiral Hyman Rickover',
 ARRAY['Admiral Chester Nimitz', 'Admiral Ernest King', 'Admiral Arleigh Burke'],
 'hard'),

((SELECT id FROM presidents WHERE number = 39),
 'What was the name of the failed 1980 military operation to rescue the American hostages held in Iran?',
 'Operation Eagle Claw',
 ARRAY['Operation Desert Rescue', 'Operation Nimble Rescue', 'Operation Sandstorm'],
 'hard');

-- ── Ronald Reagan (#40) ───────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 40),
 'Before becoming president, Reagan served as governor of which state?',
 'California',
 ARRAY['Texas', 'New York', 'Ohio'],
 'easy'),

((SELECT id FROM presidents WHERE number = 40),
 'Reagan famously declared "Mr. Gorbachev, tear down this wall!" Which structure was he referring to?',
 'The Berlin Wall',
 ARRAY['The Iron Curtain fence', 'The DMZ in Korea', 'The Great Wall of China'],
 'easy'),

((SELECT id FROM presidents WHERE number = 40),
 'Reagan survived an assassination attempt in March 1981. Who shot him?',
 'John Hinckley Jr.',
 ARRAY['Mark David Chapman', 'Arthur Bremer', 'Lynette "Squeaky" Fromme'],
 'medium'),

((SELECT id FROM presidents WHERE number = 40),
 'What 1987 arms treaty did Reagan and Gorbachev sign that eliminated an entire class of nuclear missiles?',
 'The Intermediate-Range Nuclear Forces (INF) Treaty',
 ARRAY['SALT II', 'START I', 'The Nuclear Test Ban Treaty'],
 'medium'),

((SELECT id FROM presidents WHERE number = 40),
 'Before politics, Reagan starred in films. In his most famous role, he played a dying football player named what?',
 'George "The Gipper" Gipp',
 ARRAY['Rocky Bleier', 'Jim Thorpe', 'Red Grange'],
 'medium'),

((SELECT id FROM presidents WHERE number = 40),
 'In what year did the Berlin Wall fall, vindicating Reagan''s hardline stance against the Soviet Union?',
 '1989',
 ARRAY['1987', '1991', '1990'],
 'medium'),

((SELECT id FROM presidents WHERE number = 40),
 'The Iran-Contra affair involved secretly selling arms to Iran and illegally funding rebel fighters in which country?',
 'Nicaragua',
 ARRAY['El Salvador', 'Guatemala', 'Honduras'],
 'hard'),

((SELECT id FROM presidents WHERE number = 40),
 'Reagan''s "Star Wars" missile defense proposal was officially called what?',
 'The Strategic Defense Initiative (SDI)',
 ARRAY['The Space-Based Interceptor Program', 'The Advanced Missile Shield', 'Operation High Ground'],
 'hard'),

((SELECT id FROM presidents WHERE number = 40),
 'Reagan was the only president who was formerly president of a major labor union. Which union?',
 'The Screen Actors Guild',
 ARRAY['The AFL-CIO', 'The Teamsters', 'The United Auto Workers'],
 'hard'),

((SELECT id FROM presidents WHERE number = 40),
 'Who was Ronald Reagan''s Vice President?',
 'George H.W. Bush',
 ARRAY['Bob Dole', 'Jack Kemp', 'Donald Rumsfeld'],
 'easy');

-- ── George H.W. Bush (#41) ────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 41),
 'Bush led a US-led coalition that expelled Iraq from which country in the 1991 Gulf War?',
 'Kuwait',
 ARRAY['Saudi Arabia', 'Iran', 'Jordan'],
 'easy'),

((SELECT id FROM presidents WHERE number = 41),
 'What was the name of the military operation that liberated Kuwait in 1991?',
 'Operation Desert Storm',
 ARRAY['Operation Desert Shield', 'Operation Just Cause', 'Operation Earnest Will'],
 'easy'),

((SELECT id FROM presidents WHERE number = 41),
 'Before becoming VP, Bush served as Director of which federal agency?',
 'The CIA',
 ARRAY['The FBI', 'The NSA', 'The State Department'],
 'medium'),

((SELECT id FROM presidents WHERE number = 41),
 'What famous broken campaign pledge came back to haunt Bush in the 1992 election?',
 '"Read my lips: no new taxes"',
 ARRAY['"A thousand points of light"', '"Kinder, gentler nation"', '"Morning in America"'],
 'medium'),

((SELECT id FROM presidents WHERE number = 41),
 'Who was George H.W. Bush''s Vice President?',
 'Dan Quayle',
 ARRAY['Jack Kemp', 'Bob Dole', 'James Baker'],
 'medium'),

((SELECT id FROM presidents WHERE number = 41),
 'Bush signed the Americans with Disabilities Act in what year?',
 '1990',
 ARRAY['1988', '1992', '1986'],
 'medium'),

((SELECT id FROM presidents WHERE number = 41),
 'In what state was George H.W. Bush born?',
 'Massachusetts',
 ARRAY['Texas', 'Maine', 'Connecticut'],
 'medium'),

((SELECT id FROM presidents WHERE number = 41),
 'During WWII, Bush became one of the youngest naval aviators in US history. He was shot down over which island in the Pacific?',
 'Chichi Jima',
 ARRAY['Midway', 'Iwo Jima', 'Saipan'],
 'hard'),

((SELECT id FROM presidents WHERE number = 41),
 'Who was the Democratic nominee that Bush defeated in the 1988 presidential election?',
 'Michael Dukakis',
 ARRAY['Walter Mondale', 'Jesse Jackson', 'Lloyd Bentsen'],
 'hard'),

((SELECT id FROM presidents WHERE number = 41),
 'Bush coined the phrase "New World Order." In reference to what event did he first use this term publicly?',
 'The end of the Cold War and the Gulf War coalition',
 ARRAY['The fall of the Berlin Wall alone', 'The signing of the START Treaty', 'The dissolution of the Soviet Union'],
 'hard');

-- ── Bill Clinton (#42) ────────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 42),
 'Clinton was impeached by the House of Representatives in 1998. What were the charges?',
 'Perjury and obstruction of justice',
 ARRAY['Corruption and bribery', 'Abuse of power and treason', 'Tax evasion and fraud'],
 'easy'),

((SELECT id FROM presidents WHERE number = 42),
 'What free trade agreement did Clinton sign in 1993 linking the US, Canada, and Mexico?',
 'NAFTA (North American Free Trade Agreement)',
 ARRAY['GATT', 'The WTO Agreement', 'The FTAA'],
 'easy'),

((SELECT id FROM presidents WHERE number = 42),
 'Who was Bill Clinton''s Vice President?',
 'Al Gore',
 ARRAY['Joe Biden', 'John Kerry', 'Dick Gephardt'],
 'easy'),

((SELECT id FROM presidents WHERE number = 42),
 'In what state was Bill Clinton born?',
 'Arkansas',
 ARRAY['Louisiana', 'Oklahoma', 'Tennessee'],
 'medium'),

((SELECT id FROM presidents WHERE number = 42),
 'During Clinton''s presidency, the US federal budget achieved what for the first time in decades?',
 'A surplus',
 ARRAY['Balanced budget legislation', 'Zero national debt', 'Emergency spending freeze'],
 'medium'),

((SELECT id FROM presidents WHERE number = 42),
 'The Senate acquitted Clinton after his impeachment trial. What percentage of senators must vote guilty to convict a president?',
 'Two-thirds (67%)',
 ARRAY['Simple majority (51%)', 'Three-quarters (75%)', 'Unanimous (100%)'],
 'medium'),

((SELECT id FROM presidents WHERE number = 42),
 'Clinton played which musical instrument and once considered pursuing it professionally?',
 'Saxophone',
 ARRAY['Piano', 'Guitar', 'Trumpet'],
 'medium'),

((SELECT id FROM presidents WHERE number = 42),
 'The Oslo Accords, brokered with US support during Clinton''s presidency, were a peace framework between which two parties?',
 'Israel and the Palestinian Liberation Organization (PLO)',
 ARRAY['Israel and Jordan', 'Serbia and Bosnia', 'India and Pakistan'],
 'hard'),

((SELECT id FROM presidents WHERE number = 42),
 'Clinton''s 1996 welfare reform legislation was officially named what?',
 'The Personal Responsibility and Work Opportunity Reconciliation Act',
 ARRAY['The Welfare to Work Act', 'The Social Safety Net Reform Act', 'The Public Assistance Modernization Act'],
 'hard'),

((SELECT id FROM presidents WHERE number = 42),
 'Clinton survived the Senate impeachment trial. What was the final vote on the perjury charge?',
 '45 guilty, 55 not guilty — well short of the two-thirds needed',
 ARRAY['50-50 split', '60 guilty, 40 not guilty', '55 guilty, 45 not guilty'],
 'hard');

-- ── George W. Bush (#43) ──────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 43),
 'What terrorist attacks occurred on September 11, 2001, during Bush''s first year in office?',
 'Al-Qaeda hijacked four planes, striking the World Trade Center and Pentagon',
 ARRAY['Iraqi forces attacked US embassies', 'North Korea launched missiles at US bases', 'Domestic militia bombed government buildings'],
 'easy'),

((SELECT id FROM presidents WHERE number = 43),
 'Which country did the US invade in October 2001 in response to the September 11 attacks?',
 'Afghanistan',
 ARRAY['Iraq', 'Pakistan', 'Libya'],
 'easy'),

((SELECT id FROM presidents WHERE number = 43),
 'Who was George W. Bush''s Vice President?',
 'Dick Cheney',
 ARRAY['Colin Powell', 'Condoleezza Rice', 'Donald Rumsfeld'],
 'easy'),

((SELECT id FROM presidents WHERE number = 43),
 'What legislation greatly expanded domestic surveillance powers in the weeks after 9/11?',
 'The USA PATRIOT Act',
 ARRAY['The Foreign Intelligence Surveillance Act', 'The Homeland Security Act', 'The Intelligence Reform Act'],
 'medium'),

((SELECT id FROM presidents WHERE number = 43),
 'The US invaded Iraq in March 2003. What was the primary stated justification?',
 'Iraq allegedly possessing weapons of mass destruction (WMDs)',
 ARRAY['Iraq''s direct role in 9/11', 'Oil supply security', 'Revenge for the 1991 Gulf War'],
 'medium'),

((SELECT id FROM presidents WHERE number = 43),
 'Bush''s response to Hurricane Katrina in 2005 was widely criticized for being what?',
 'Too slow and inadequate',
 ARRAY['Too aggressive and militarized', 'Politically biased', 'Excessively expensive'],
 'medium'),

((SELECT id FROM presidents WHERE number = 43),
 'Bush signed the No Child Left Behind Act in 2002 with bipartisan support. Which Democratic senator was his main partner?',
 'Ted Kennedy',
 ARRAY['John Kerry', 'Hillary Clinton', 'Daniel Patrick Moynihan'],
 'hard'),

((SELECT id FROM presidents WHERE number = 43),
 'Bush''s first Secretary of State was the first Black American to hold that position. Who was it?',
 'Colin Powell',
 ARRAY['Condoleezza Rice', 'Madeleine Albright', 'Warren Christopher'],
 'medium'),

((SELECT id FROM presidents WHERE number = 43),
 'The $700 billion bank bailout package passed during the 2008 financial crisis was called what?',
 'The Troubled Asset Relief Program (TARP)',
 ARRAY['The Economic Stimulus Act', 'The American Recovery Act', 'The Bank Stabilization Fund'],
 'hard'),

((SELECT id FROM presidents WHERE number = 43),
 'What was the name of the 2003 Medicare expansion that added prescription drug coverage for seniors?',
 'Medicare Part D (Medicare Modernization Act)',
 ARRAY['Medicare Part C', 'The Senior Drug Relief Act', 'The Prescription Benefit Extension Act'],
 'hard');

-- ── Barack Obama (#44) ────────────────────────────────────────────────────────
INSERT INTO trivia_questions (president_id, question, correct_answer, wrong_answers, difficulty) VALUES
((SELECT id FROM presidents WHERE number = 44),
 'Barack Obama made history as the first person of what background to be elected US president?',
 'African American',
 ARRAY['Asian American', 'Latino', 'Mixed race with a foreign-born parent'],
 'easy'),

((SELECT id FROM presidents WHERE number = 44),
 'What was the informal name of Obama''s landmark healthcare reform law passed in 2010?',
 'Obamacare (Affordable Care Act)',
 ARRAY['Medicare for All', 'Universal Healthcare Act', 'The Public Option Act'],
 'easy'),

((SELECT id FROM presidents WHERE number = 44),
 'In what year did Obama win the Nobel Peace Prize?',
 '2009',
 ARRAY['2007', '2011', '2013'],
 'medium'),

((SELECT id FROM presidents WHERE number = 44),
 'Obama ordered the covert Navy SEAL mission in 2011 that killed which terrorist leader?',
 'Osama bin Laden',
 ARRAY['Saddam Hussein', 'Abu Musab al-Zarqawi', 'Ayman al-Zawahiri'],
 'easy'),

((SELECT id FROM presidents WHERE number = 44),
 'In what state was Barack Obama born?',
 'Hawaii',
 ARRAY['Illinois', 'Washington', 'California'],
 'medium'),

((SELECT id FROM presidents WHERE number = 44),
 'Obama''s 2009 economic recovery legislation was called what?',
 'The American Recovery and Reinvestment Act',
 ARRAY['The Economic Stimulus Plan', 'The Bank Rescue Act', 'The Jobs Creation and Infrastructure Act'],
 'medium'),

((SELECT id FROM presidents WHERE number = 44),
 'Before the US Senate, Obama was a state senator and taught constitutional law in which state?',
 'Illinois',
 ARRAY['New York', 'California', 'Michigan'],
 'medium'),

((SELECT id FROM presidents WHERE number = 44),
 'Obama won the presidency in 2008, defeating which Republican senator?',
 'John McCain',
 ARRAY['Mitt Romney', 'John Kerry', 'Bob Dole'],
 'medium'),

((SELECT id FROM presidents WHERE number = 44),
 'What nuclear arms reduction treaty did Obama sign with Russia in 2010?',
 'The New START Treaty',
 ARRAY['SALT III', 'The INF Treaty', 'The Nuclear Non-Proliferation Treaty'],
 'hard'),

((SELECT id FROM presidents WHERE number = 44),
 'What was the name of Obama''s memoir published in November 2020?',
 'A Promised Land',
 ARRAY['Dreams from My Father', 'The Audacity of Hope', 'My American Journey'],
 'hard');
