import { House, Location, ClassTask, Language } from './types';
import { TRANSLATIONS } from './translations';

export const getInitialLocations = (lang: Language = 'en'): Location[] => {
  const t = TRANSLATIONS[lang].locations;
  return [
    {
      id: 'great-hall',
      name: t['great-hall'].name,
      description: t['great-hall'].desc,
      npcs: ['Nearly Headless Nick', 'Student Prefect', 'The Bloody Baron'],
      connectedTo: ['corridor-1f', 'courtyard'],
    },
    {
      id: 'corridor-1f',
      name: t['corridor-1f'].name,
      description: t['corridor-1f'].desc,
      npcs: ['Peeves', 'Mrs. Norris'],
      connectedTo: ['great-hall', 'transfiguration-classroom', 'charms-classroom', 'grand-staircase'],
    },
    {
      id: 'grand-staircase',
      name: t['grand-staircase'].name,
      description: t['grand-staircase'].desc,
      npcs: ['Lost First Year'],
      connectedTo: ['corridor-1f', 'dungeons'],
    },
    {
      id: 'dungeons',
      name: t['dungeons'].name,
      description: t['dungeons'].desc,
      npcs: ['Slytherin Student'],
      connectedTo: ['grand-staircase', 'potions-classroom'],
    },
    {
      id: 'potions-classroom',
      name: t['potions-classroom'].name,
      description: t['potions-classroom'].desc,
      npcs: ['Professor Snape (Hologram)'],
      connectedTo: ['dungeons'],
    },
    {
      id: 'transfiguration-classroom',
      name: t['transfiguration-classroom'].name,
      description: t['transfiguration-classroom'].desc,
      npcs: ['Professor McGonagall (Hologram)'],
      connectedTo: ['corridor-1f'],
    },
    {
      id: 'charms-classroom',
      name: t['charms-classroom'].name,
      description: t['charms-classroom'].desc,
      npcs: ['Professor Flitwick (Hologram)'],
      connectedTo: ['corridor-1f'],
    },
    {
      id: 'courtyard',
      name: t['courtyard'].name,
      description: t['courtyard'].desc,
      npcs: ['Luna Lovegood (Type)'],
      connectedTo: ['great-hall', 'greenhouse'],
    },
    {
      id: 'greenhouse',
      name: t['greenhouse'].name,
      description: t['greenhouse'].desc,
      npcs: ['Professor Sprout (Hologram)'],
      connectedTo: ['courtyard'],
    }
  ];
};

export const getInitialSchedule = (lang: Language = 'en'): ClassTask[] => {
  const t = TRANSLATIONS[lang].classes;
  return [
    { id: 'c1', subject: t['c1'].subject, description: t['c1'].desc, completed: false, locationId: 'potions-classroom' },
    { id: 'c2', subject: t['c2'].subject, description: t['c2'].desc, completed: false, locationId: 'transfiguration-classroom' },
    { id: 'c3', subject: t['c3'].subject, description: t['c3'].desc, completed: false, locationId: 'charms-classroom' },
    { id: 'c4', subject: t['c4'].subject, description: t['c4'].desc, completed: false, locationId: 'greenhouse' },
    { id: 'c5', subject: t['c5'].subject, description: t['c5'].desc, completed: false, locationId: 'great-hall' },
  ];
};

export const HOUSE_COLORS = {
  [House.Gryffindor]: 'bg-red-900 text-yellow-400 border-yellow-600',
  [House.Slytherin]: 'bg-green-900 text-gray-200 border-gray-400',
  [House.Ravenclaw]: 'bg-blue-900 text-yellow-600 border-yellow-600',
  [House.Hufflepuff]: 'bg-yellow-500 text-black border-black',
  [House.Unsorted]: 'bg-gray-800 text-gray-400 border-gray-600',
};