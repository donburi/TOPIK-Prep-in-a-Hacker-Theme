import { SkillNode } from '../types';

export const SKILL_TREE: SkillNode[] = [
  {
    id: 'hp_boost_1',
    name: 'Biometric Reinforcement I',
    description: 'Increases Maximum HP by 10 units.',
    cost: 1500,
    category: 'COMBAT',
    effect: { type: 'MAX_HP', value: 10 }
  },
  {
    id: 'hp_boost_2',
    name: 'Biometric Reinforcement II',
    description: 'Increases Maximum HP by an additional 15 units.',
    cost: 4000,
    category: 'COMBAT',
    dependsOn: 'hp_boost_1',
    effect: { type: 'MAX_HP', value: 15 }
  },
  {
    id: 'credit_up_1',
    name: 'Neural Optimization I',
    description: 'Boosts credits earned by 15%.',
    cost: 2000,
    category: 'ECONOMY',
    effect: { type: 'CREDIT_BOOST', value: 0.15 }
  },
  {
    id: 'credit_up_2',
    name: 'Neural Optimization II',
    description: 'Boosts credits earned by an additional 20%.',
    cost: 5000,
    category: 'ECONOMY',
    dependsOn: 'credit_up_1',
    effect: { type: 'CREDIT_BOOST', value: 0.20 }
  },
  {
    id: 'hint_shield_1',
    name: 'Signal Shielding',
    description: 'Reduces the penalty for scanning individual cards from 10% to 5%.',
    cost: 3000,
    category: 'UTILITY',
    effect: { type: 'HINT_PENALTY_REDUCTION', value: 0.5 } // 50% relative reduction of the penalty
  },
  {
    id: 'heal_mission_1',
    name: 'Data Recovery Protocol',
    description: 'Increases HP restoration on mission clear from 5 to 10.',
    cost: 3500,
    category: 'UTILITY',
    effect: { type: 'HEAL_ON_MISSION', value: 5 }
  }
];
