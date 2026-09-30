import { Stage, TeamRole } from '../types';

export const CREWS_POOL: Stage[] = [
  { id: 'Battlefield', name: 'Battlefield', img: '/assets/stages/battlefield.jpg', isStarter: true },
  { id: 'kalos', name: 'Kalos Pokémon League', img: '/assets/stages/kalos.jpg', isStarter: false },
  { id: 'pokemon-stadium-2', name: 'Pokémon Stadium 2', img: '/assets/stages/ps2.jpg', isStarter: true },
  { id: 'town-and-city', name: 'Town & City', img: '/assets/stages/town_and_city.jpg', isStarter: true },
  { id: 'small-battlefield', name: 'Small Battlefield', img: '/assets/stages/small_battlefield.jpg', isStarter: true },
  { id: 'final-destination', name: 'Final Destination', img: '/assets/stages/final_destination.jpg', isStarter: false },
  { id: 'smashville', name: 'Smashville', img: '/assets/stages/smashville.jpg', isStarter: true },
  { id: 'unova', name: 'Unova Pokémon League', img: '/assets/stages/unova.png', isStarter: false },
  { id: 'hollow-bastion', name: 'Hollow Bastion', img: '/assets/stages/hollow_bastion.jpg', isStarter: false }
];

export const SOLOS_STARTERS: Stage[] = [
  { id: 'Battlefield', name: 'Battlefield', img: '/assets/stages/battlefield.jpg', isStarter: true },
  { id: 'pokemon-stadium-2', name: 'Pokémon Stadium 2', img: '/assets/stages/ps2.jpg', isStarter: true },
  { id: 'smashville', name: 'Smashville', img: '/assets/stages/smashville.jpg', isStarter: true },
  { id: 'town-and-city', name: 'Town & City', img: '/assets/stages/town_and_city.jpg', isStarter: true },
  { id: 'small-battlefield', name: 'Small Battlefield', img: '/assets/stages/small_battlefield.jpg', isStarter: true }
];

export const SOLOS_COUNTERPICKS: Stage[] = [
  { id: 'kalos', name: 'Kalos Pokémon League', img: '/assets/stages/kalos.jpg', isStarter: false },
  { id: 'hollow-bastion', name: 'Hollow Bastion', img: '/assets/stages/hollow_bastion.jpg', isStarter: false },
  { id: 'final-destination', name: 'Final Destination', img: '/assets/stages/final_destination.jpg', isStarter: false }
];

export interface StepConfig {
  team: TeamRole;
  action: 'ban' | 'pick';
  label: string;
}

// Crews Game 1 Striking: H - A - A - H - H - A - A - H - (last stage auto-picked)
export const CREWS_GAME1_STEPS: StepConfig[] = [
  { team: 'home', action: 'ban', label: 'Home Team: Ban 1st Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 1st Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 2nd Stage' },
  { team: 'home', action: 'ban', label: 'Home Team: Ban 2nd Stage' },
  { team: 'home', action: 'ban', label: 'Home Team: Ban 3rd Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 3rd Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 4th Stage' },
  { team: 'home', action: 'ban', label: 'Home Team: Ban 4th Stage' }
];

// Solos Game 1 Striking: H - A - A - H (Home picks between remaining 2)
export const SOLOS_GAME1_STEPS: StepConfig[] = [
  { team: 'home', action: 'ban', label: 'Home Team: Ban 1 Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 1st Stage' },
  { team: 'away', action: 'ban', label: 'Away Team: Ban 2nd Stage' },
  { team: 'home', action: 'pick', label: 'Home Team: Pick Stage' }
];
