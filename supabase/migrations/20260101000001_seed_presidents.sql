-- Seed: Presidents
-- preceded_by / succeeded_by set via UPDATE after all rows inserted to avoid FK violations.

INSERT INTO presidents (
  number, name, first_name, last_name, nickname,
  term_start, term_end,
  party, home_state,
  birth_year, death_year, birth_place,
  vice_presidents,
  preceded_by, succeeded_by,
  historian_ranking,
  era,
  tagline,
  famous_quote,
  key_achievements,
  defining_moment,
  did_you_know
) VALUES (
  1,
  $$George Washington$$,
  $$George$$,
  $$Washington$$,
  $$Father of His Country$$,
  1789, 1797,
  $$Unaffiliated$$,
  $$Virginia$$,
  1732, 1799,
  $$Pope's Creek, Westmoreland County, Virginia$$,
  ARRAY[$$John Adams$$],
  NULL, NULL,
  2,
  $$founding$$,
  $$First in war. First in peace. He set the standard — then walked away.$$,
  $$To be prepared for war is one of the most effective means of preserving peace.$$,
  ARRAY[
    $$Led the Continental Army to victory in the Revolutionary War$$,
    $$Presided over the Constitutional Convention of 1787$$,
    $$Established the two-term presidential precedent$$,
    $$Created the Cabinet system of executive government$$,
    $$Signed the Residence Act establishing the nation's permanent capital$$
  ],
  $$Voluntarily relinquishing power after two terms — an act so remarkable that King George III called him "the greatest man in the world" — establishing the democratic norm of peaceful transfer of power.$$,
  $$His famous "wooden teeth" are a myth. His dentures were actually crafted from ivory, human teeth, and animal teeth set in lead. He also never lived in the White House — it wasn't completed until John Adams moved in, a year after Washington's death.$$
);
