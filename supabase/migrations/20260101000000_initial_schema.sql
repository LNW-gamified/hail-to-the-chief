-- Presidents table (core data)
CREATE TABLE presidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL, -- 1-46
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nickname TEXT,
  term_start INTEGER NOT NULL, -- year
  term_end INTEGER, -- null if current
  party TEXT,
  home_state TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  birth_place TEXT,
  vice_presidents TEXT[], -- array of VP names
  preceded_by INTEGER REFERENCES presidents(number),
  succeeded_by INTEGER REFERENCES presidents(number),
  historian_ranking INTEGER, -- C-SPAN ranking 1-45
  era TEXT, -- founding, antebellum, civil_war, gilded_age, progressive, new_deal, cold_war, modern, current
  tagline TEXT, -- e.g. "New Deal. WWII. Four terms."
  famous_quote TEXT,
  key_achievements TEXT[],
  defining_moment TEXT,
  did_you_know TEXT,
  portrait_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (libraries + historic sites)
CREATE TABLE presidential_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  president_id UUID REFERENCES presidents(id),
  name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- nara_library, historic_site, birthplace, home, monument, gravesite, experience
  tier INTEGER NOT NULL, -- 1=NARA library, 2=historic site, 3=experience
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  description TEXT,
  hours TEXT,
  admission TEXT,
  website_url TEXT,
  image_url TEXT,
  signature_exhibits TEXT[], -- notable things to see
  collection_size TEXT, -- e.g. "45 million pages"
  annual_visitors TEXT,
  year_opened INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User visits
CREATE TABLE location_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES presidential_locations(id),
  visit_date DATE NOT NULL,
  ticket_section TEXT,
  ticket_row TEXT,
  ticket_seats TEXT[],
  ticket_confirmation TEXT,
  notes TEXT,
  moments TEXT[],
  photos TEXT[],
  weather_temp TEXT,
  weather_conditions TEXT,
  weather_wind TEXT,
  drive_distance_miles NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trip_type TEXT DEFAULT 'presidential', -- presidential, historic_site, mixed
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned', -- planned, in_progress, completed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip stops
CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  location_id UUID REFERENCES presidential_locations(id),
  stop_order INTEGER,
  visit_date DATE,
  ticket_section TEXT,
  ticket_row TEXT,
  ticket_seats TEXT[],
  ticket_confirmation TEXT,
  estimated_tickets NUMERIC DEFAULT 0,
  actual_tickets NUMERIC,
  estimated_food NUMERIC DEFAULT 0,
  actual_food NUMERIC,
  estimated_parking NUMERIC DEFAULT 0,
  actual_parking NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip costs
CREATE TABLE trip_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  estimated_travel NUMERIC DEFAULT 0,
  actual_travel NUMERIC,
  estimated_hotel NUMERIC DEFAULT 0,
  actual_hotel NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stop checklists
CREATE TABLE stop_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- photos, exhibits, gift_shop, must_do, learn
  item TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  suggested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- trail, geography, historical, experience, knowledge, journal, legendary
  icon TEXT,
  points INTEGER DEFAULT 25,
  tracking_type TEXT NOT NULL, -- auto_visit, manual_once, manual_repeatable, quiz
  trigger_condition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  claim_note TEXT,
  extra_data JSONB,
  manually_claimed BOOLEAN DEFAULT FALSE
);

-- Achievement claims (repeatable)
CREATE TABLE achievement_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  location_visit_id UUID REFERENCES location_visits(id),
  claim_date DATE,
  notes TEXT,
  extra_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presidential trivia questions
CREATE TABLE trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  president_id UUID REFERENCES presidents(id),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL, -- 3 wrong answers
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User trivia scores
CREATE TABLE trivia_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  president_id UUID REFERENCES presidents(id),
  score INTEGER NOT NULL, -- out of 10
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- On This Day facts
CREATE TABLE on_this_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  year INTEGER,
  president_id UUID REFERENCES presidents(id),
  fact TEXT NOT NULL,
  category TEXT -- birth, death, inauguration, legislation, war, scandal, achievement
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  home_city TEXT,
  home_state TEXT,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE location_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stop_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all reference data
ALTER TABLE presidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE presidential_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_this_day ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read presidents" ON presidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read locations" ON presidential_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read achievements" ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read trivia" ON trivia_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone authenticated can read on this day" ON on_this_day FOR SELECT TO authenticated USING (true);

-- User-specific policies
CREATE POLICY "Users manage own visits" ON location_visits FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own trips" ON trips FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own stops" ON trip_stops FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id));
CREATE POLICY "Users manage own costs" ON trip_costs FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id));
CREATE POLICY "Users manage own checklists" ON stop_checklists FOR ALL TO authenticated USING (true);
CREATE POLICY "Users manage own achievements" ON user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own claims" ON achievement_claims FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own scores" ON trivia_scores FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL TO authenticated USING (auth.uid() = id);
