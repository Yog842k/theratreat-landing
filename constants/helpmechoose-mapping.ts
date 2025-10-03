// Mapping from HelpMeChoose category IDs to search keywords used on therapists listing page
// Extend or refine these keyword strings to improve matching quality.
export const helpMeChooseCategoryToSearch: Record<string, string> = {
  'mind-emotions': 'anxiety depression stress mood trauma grief burnout',
  'pain-injury': 'pain injury rehabilitation ortho musculoskeletal sports',
  'child-growth': 'child pediatric speech learning adhd autism development',
  'health-recovery': 'stroke neuro rehabilitation surgery recovery paralysis',
  'womens-health': 'women pcos pms menopause pregnancy postpartum hormonal',
  'daily-life-support': 'senior disability caregiver mobility daily living support',
  'behavioral-relationship': 'relationship anger aggression addiction family conflict',
  'cognitive-brain': 'memory attention brain fog dementia neuro cognitive',
  'occupational-work': 'work stress burnout occupational performance return-to-work',
  'lifestyle-habits': 'sleep lifestyle routine obesity fatigue wellness habits',
  'not-sure': ''
};
