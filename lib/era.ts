export const ERA_COLORS: Record<string, string> = {
  founding:    '#8B7355',
  antebellum:  '#6B4226',
  civil_war:   '#2C4A7C',
  gilded_age:  '#8B6914',
  progressive: '#2C5530',
  new_deal:    '#8B1A1A',
  cold_war:    '#4A4A4A',
  modern:      '#1A3A5C',
  current:     '#1A3A5C',
};

export const ERA_LABELS: Record<string, string> = {
  founding:    'Founding Era',
  antebellum:  'Antebellum',
  civil_war:   'Civil War',
  gilded_age:  'Gilded Age',
  progressive: 'Progressive Era',
  new_deal:    'New Deal',
  cold_war:    'Cold War',
  modern:      'Modern Era',
  current:     'Contemporary',
};

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
