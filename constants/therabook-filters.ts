// TheraBook Filter & Search System Constants

// 1️⃣ Primary Filters (Home Page / Quick Access)
export const PRIMARY_FILTERS = [
  {
    id: 'mind-emotions',
    label: 'Mind & Emotions',
    description: 'For anxiety, depression, stress, mood changes, emotional imbalance, grief, trauma, burnout, etc.',
    icon: '🧠'
  },
  {
    id: 'pain-injury-recovery',
    label: 'Pain, Injury or Recovery',
    description: 'For muscle, joint, back, or nerve pain, post-injury rehabilitation, sports injuries, or physical recovery needs.',
    icon: '🦴'
  },
  {
    id: 'child-growth-learning',
    label: 'Child Growth & Learning',
    description: 'For speech delay, handwriting issues, behavior concerns, autism, ADHD, developmental delays, learning difficulties, etc.',
    icon: '👶'
  },
  {
    id: 'health-recovery-rehab',
    label: 'Health Recovery & Rehab',
    description: 'For recovery after stroke, accident, surgery, paralysis, neurological issues, ICU stays, etc.',
    icon: '🏥'
  },
  {
    id: 'womens-health',
    label: "Women's Health & Life Stages",
    description: 'For pregnancy/postpartum care, menstrual issues, PCOD/PCOS, menopause, sexual health, body changes, and emotional health in women.',
    icon: '👩'
  },
  {
    id: 'daily-life-support',
    label: 'Daily Life, Support & Special Needs',
    description: 'For challenges in daily tasks, senior care, disability support, mobility aids, caregiver help, home therapy support, etc.',
    icon: '🤝'
  },
  {
    id: 'behavioural-relationship',
    label: 'Behavioural & Relationship Wellness',
    description: 'For relationship problems, anger, aggression, social difficulties, family conflicts, parenting stress, addiction, etc.',
    icon: '💕'
  },
  {
    id: 'cognitive-brain',
    label: 'Cognitive & Brain Functioning',
    description: 'For memory loss, attention/focus issues, slow thinking, brain fog, dementia, head injury effects, neuro rehab, etc.',
    icon: '🧠'
  },
  {
    id: 'occupational-work',
    label: 'Occupational & Work-Life Stress',
    description: 'For professional burnout, low motivation, workplace anxiety, poor performance, return-to-work issues, or job-related rehab.',
    icon: '💼'
  },
  {
    id: 'lifestyle-holistic',
    label: 'Lifestyle, Habits & Holistic Care',
    description: 'For poor sleep, unhealthy habits, low energy, self-care, obesity, fatigue, post-COVID recovery, and building a better routine.',
    icon: '🌿'
  },
  {
    id: 'not-sure',
    label: 'Not Sure / I Need Help to Understand',
    description: "Select this option if you're unsure or can't identify your concern. We'll help you figure it out.",
    icon: '🟡'
  }
];

// 2️⃣ Category Filters (Main Condition Types)
export const CATEGORY_FILTERS = {
  neurological: {
    label: '🧠 Neurological & Neurodevelopmental Conditions',
    conditions: [
      'Autism Spectrum Disorder (ASD)',
      'Attention Deficit Hyperactivity Disorder (ADHD)',
      'Cerebral Palsy',
      'Down Syndrome',
      'Developmental Delays',
      'Sensory Processing Disorder',
      'Intellectual Disabilities',
      'Traumatic Brain Injury (TBI)',
      'Stroke (Post-Stroke Rehabilitation)',
      'Epilepsy',
      'Multiple Sclerosis',
      "Parkinson's Disease",
      "Alzheimer's Disease",
      "Huntington's Disease",
      "Guillain-Barré Syndrome"
    ]
  },
  orthopedic: {
    label: '🦴 Orthopedic & Musculoskeletal Conditions',
    conditions: [
      'Fractures and Dislocations',
      'Arthritis (Rheumatoid, Osteoarthritis)',
      'Scoliosis',
      'Frozen Shoulder',
      'Sports Injuries',
      'Sprains and Strains',
      'Post-Surgical Rehabilitation (e.g. joint replacements)',
      'Back and Neck Pain',
      'Postural Deformities',
      'Carpal Tunnel Syndrome',
      'Plantar Fasciitis',
      'Tendonitis',
      'Spinal Cord Injury'
    ]
  },
  cardiovascular: {
    label: '❤️ Cardiovascular & Pulmonary Conditions',
    conditions: [
      'Post-Heart Attack (MI) Rehabilitation',
      'Hypertension',
      'Coronary Artery Disease',
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Asthma',
      'Congestive Heart Failure',
      'Post-CABG (Bypass Surgery) Recovery',
      'Post-COVID Rehabilitation',
      'Deep Vein Thrombosis (DVT)',
      'Pulmonary Fibrosis'
    ]
  },
  psychological: {
    label: '🧘‍♀️ Psychological & Psychiatric Conditions',
    conditions: [
      'Depression',
      'Anxiety Disorders',
      'Obsessive-Compulsive Disorder (OCD)',
      'Bipolar Disorder',
      'Schizophrenia',
      'Post-Traumatic Stress Disorder (PTSD)',
      'Eating Disorders (Anorexia, Bulimia, Binge Eating)',
      'Personality Disorders',
      'Sleep Disorders (Insomnia, Sleep Apnea)',
      'Substance Use/Addiction',
      'Self-Harm & Suicidal Ideation',
      'Panic Disorder',
      'Phobias'
    ]
  },
  pediatric: {
    label: '🧒 Pediatric Conditions',
    conditions: [
      'Learning Disabilities (Dyslexia, Dysgraphia, Dyscalculia)',
      'Speech and Language Delays',
      'Motor Coordination Disorders (Dyspraxia)',
      'Feeding Difficulties',
      'Behavioral Challenges',
      'Autism & ADHD (covered above)',
      'Premature Birth Complications',
      'Developmental Apraxia of Speech',
      'Visual-Motor Integration Issues'
    ]
  },
  geriatric: {
    label: '👩‍🦳 Geriatric Conditions',
    conditions: [
      "Dementia & Alzheimer's",
      'Fall Risk & Balance Issues',
      "Parkinson's (covered above)",
      'Arthritis (covered above)',
      'Post-Surgery Rehab (Hip, Knee replacements)',
      'Osteoporosis',
      'Age-related Hearing/Vision Loss',
      'Incontinence',
      'Social Isolation & Depression',
      'Polypharmacy Side Effects'
    ]
  },
  womensHealth: {
    label: "💕 Women's Health Conditions",
    conditions: [
      'Postpartum Depression',
      'PCOS & Hormonal Imbalance Support',
      'Infertility Counseling',
      'Menopause Management',
      'Prenatal & Postnatal Physiotherapy',
      'Pelvic Floor Dysfunction',
      'Sexual Health Issues',
      'Breast Cancer Rehab'
    ]
  },
  surgical: {
    label: '🧑‍⚕️ Surgical & Medical Recovery',
    conditions: [
      'Post-Orthopedic Surgeries',
      'Post-Neurosurgeries',
      'Post-Cardiac Surgeries',
      'Post-Cancer Therapy (Chemo/Radiation Recovery)',
      'Scar Management',
      'Lymphedema',
      'Wound Healing Support',
      'Amputation & Prosthesis Training'
    ]
  },
  speech: {
    label: '🗣️ Speech & Language Conditions',
    conditions: [
      'Aphasia',
      'Stuttering',
      'Articulation Disorders',
      'Voice Disorders',
      'Language Delay',
      'Auditory Processing Disorders',
      'Mutism',
      'Resonance Disorders'
    ]
  },
  sensory: {
    label: '👁️ Sensory & Perceptual Disorders',
    conditions: [
      'Sensory Integration Disorder',
      'Visual Processing Disorder',
      'Auditory Processing Disorder',
      'Tactile Defensiveness',
      'Body Awareness Challenges',
      'Proprioception & Vestibular Dysfunction'
    ]
  },
  occupational: {
    label: '👩‍⚕️ Occupational Therapy Specific Concerns',
    conditions: [
      'Activities of Daily Living (ADL) Difficulties',
      'Handwriting Issues',
      'Fine Motor Skill Delay',
      'Time Management/Executive Function',
      'Vocational Rehabilitation',
      'Social Skills Training',
      'Assistive Device Training'
    ]
  },
  lifestyle: {
    label: '🌍 Community & Lifestyle Disorders',
    conditions: [
      'Work Stress & Burnout',
      'Internet/Game Addiction',
      'Anger Management',
      'Career Confusion',
      'Relationship Issues',
      'Parenting Challenges',
      'Grief & Loss',
      'Low Self-Esteem',
      'Screentime'
    ]
  }
};

// 3️⃣ Sub-Filters (Therapy Types)
export const THERAPY_TYPES = [
  'Behavioural Therapist',
  'Cognitive Behavioural Therapist',
  'Neuro-Developmental Therapist',
  'Occupational Therapist',
  'Physiotherapist',
  'Special Educator',
  'Speech and Language Pathologist',
  'Sports Therapist',
  'ABA Therapist',
  'Acupuncture/Acupressure Therapist',
  'Animal-Assisted Therapist',
  'Aqua Therapist',
  'Aromatherapist',
  'Art Therapist',
  'Chiropractor / Osteopath',
  'Clinical Psychologist',
  'Cupping Therapist',
  'Dance Movement Therapist',
  'Dietician',
  'Fitness Instructor',
  'Hand Therapist',
  'Holistic/Hypnotherapist',
  'Horticultural Therapist',
  'Massage Therapist',
  'Music Therapist',
  'Naturopathic Therapist',
  'Neonatal Therapist',
  'Orthotistician',
  'Prosthetist',
  'Panchakarma Therapist',
  'Play Therapist',
  'Psychotherapist',
  'Recreational Therapist',
  'Rehabilitation Therapist',
  'Yoga Therapist'
];

// Helper function to get all conditions as a flat array
export const getAllConditions = (): string[] => {
  return Object.values(CATEGORY_FILTERS).flatMap(category => category.conditions);
};

// Helper function to get conditions by primary filter
export const getConditionsByPrimaryFilter = (primaryFilterId: string): string[] => {
  const mapping: Record<string, string[]> = {
    'mind-emotions': [
      ...CATEGORY_FILTERS.psychological.conditions,
      ...CATEGORY_FILTERS.lifestyle.conditions.filter(c => 
        ['Work Stress & Burnout', 'Anger Management', 'Relationship Issues', 'Parenting Challenges', 'Grief & Loss', 'Low Self-Esteem'].includes(c)
      )
    ],
    'pain-injury-recovery': [
      ...CATEGORY_FILTERS.orthopedic.conditions,
      ...CATEGORY_FILTERS.surgical.conditions.filter(c => c.includes('Orthopedic'))
    ],
    'child-growth-learning': [
      ...CATEGORY_FILTERS.pediatric.conditions,
      ...CATEGORY_FILTERS.neurological.conditions.filter(c => 
        ['Autism Spectrum Disorder (ASD)', 'Attention Deficit Hyperactivity Disorder (ADHD)', 'Developmental Delays'].includes(c)
      ),
      ...CATEGORY_FILTERS.speech.conditions.filter(c => c.includes('Delay') || c.includes('Disorder'))
    ],
    'health-recovery-rehab': [
      ...CATEGORY_FILTERS.surgical.conditions,
      ...CATEGORY_FILTERS.cardiovascular.conditions,
      ...CATEGORY_FILTERS.neurological.conditions.filter(c => 
        ['Stroke (Post-Stroke Rehabilitation)', 'Traumatic Brain Injury (TBI)'].includes(c)
      )
    ],
    'womens-health': [
      ...CATEGORY_FILTERS.womensHealth.conditions
    ],
    'daily-life-support': [
      ...CATEGORY_FILTERS.occupational.conditions,
      ...CATEGORY_FILTERS.geriatric.conditions,
      ...CATEGORY_FILTERS.sensory.conditions
    ],
    'behavioural-relationship': [
      ...CATEGORY_FILTERS.psychological.conditions.filter(c => 
        ['Personality Disorders', 'Substance Use/Addiction'].includes(c)
      ),
      ...CATEGORY_FILTERS.lifestyle.conditions.filter(c => 
        ['Relationship Issues', 'Parenting Challenges', 'Anger Management'].includes(c)
      )
    ],
    'cognitive-brain': [
      ...CATEGORY_FILTERS.neurological.conditions.filter(c => 
        ["Alzheimer's Disease", 'Dementia'].includes(c) || c.includes('Brain')
      ),
      ...CATEGORY_FILTERS.geriatric.conditions.filter(c => c.includes('Dementia') || c.includes('Alzheimer'))
    ],
    'occupational-work': [
      ...CATEGORY_FILTERS.lifestyle.conditions.filter(c => 
        ['Work Stress & Burnout', 'Career Confusion'].includes(c)
      ),
      ...CATEGORY_FILTERS.occupational.conditions.filter(c => 
        ['Vocational Rehabilitation', 'Time Management/Executive Function'].includes(c)
      )
    ],
    'lifestyle-holistic': [
      ...CATEGORY_FILTERS.lifestyle.conditions.filter(c => 
        ['Internet/Game Addiction', 'Screentime', 'Low Self-Esteem'].includes(c)
      ),
      ...CATEGORY_FILTERS.psychological.conditions.filter(c => 
        ['Sleep Disorders (Insomnia, Sleep Apnea)'].includes(c)
      )
    ]
  };
  
  return mapping[primaryFilterId] || [];
};

