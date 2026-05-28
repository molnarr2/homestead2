import { AnimalTypeBreed, AnimalTypeCareTemplate } from '../../../schema/animalType/AnimalType'

export interface StarterPlaybook {
  colors: string[]
  breeds: (Omit<AnimalTypeBreed, 'id' | 'gestationDays'> & { gestationDays?: number })[]
  careTemplates: Omit<AnimalTypeCareTemplate, 'id' | 'contactName' | 'contactPhone'>[]
}

export const STARTER_PLAYBOOKS: Record<string, StarterPlaybook> = {
  'Chicken': {
    colors: ['White', 'Brown', 'Black', 'Red', 'Buff'],
    breeds: [
      { name: 'Rhode Island Red' },
      { name: 'Plymouth Rock' },
      { name: 'Leghorn' },
      { name: 'Orpington' },
      { name: 'Australorp' },
    ],
    careTemplates: [
      { name: 'Deworming', type: 'careRecurring', cycle: 90, healthRecordType: 'deworming' },
      { name: 'Coop Cleaning', type: 'careRecurring', cycle: 7, healthRecordType: '' },
      { name: 'Mite/Lice Check', type: 'careRecurring', cycle: 30, healthRecordType: '' },
    ],
  },
  'Goat': {
    colors: ['White', 'Brown', 'Black', 'Spotted'],
    breeds: [
      { name: 'Alpine', gestationDays: 150 },
      { name: 'Nubian', gestationDays: 150 },
      { name: 'Nigerian Dwarf', gestationDays: 145 },
      { name: 'Boer', gestationDays: 150 },
      { name: 'LaMancha', gestationDays: 150 },
    ],
    careTemplates: [
      { name: 'Hoof Trim', type: 'careRecurring', cycle: 42, healthRecordType: '' },
      { name: 'Deworming', type: 'careRecurring', cycle: 90, healthRecordType: 'deworming' },
      { name: 'CDT Vaccination', type: 'careRecurring', cycle: 365, healthRecordType: 'vaccination' },
      { name: 'Selenium/Vitamin E', type: 'careRecurring', cycle: 90, healthRecordType: 'medication' },
    ],
  },
  'Cattle': {
    colors: ['Black', 'Red', 'Brown', 'White', 'Spotted'],
    breeds: [
      { name: 'Angus', gestationDays: 283 },
      { name: 'Hereford', gestationDays: 283 },
      { name: 'Holstein', gestationDays: 280 },
      { name: 'Jersey', gestationDays: 279 },
      { name: 'Highland', gestationDays: 283 },
    ],
    careTemplates: [
      { name: 'Hoof Trim', type: 'careRecurring', cycle: 60, healthRecordType: '' },
      { name: 'Deworming', type: 'careRecurring', cycle: 120, healthRecordType: 'deworming' },
      { name: 'Vaccination (5-way)', type: 'careRecurring', cycle: 365, healthRecordType: 'vaccination' },
    ],
  },
  'Sheep': {
    colors: ['White', 'Black', 'Brown', 'Gray'],
    breeds: [
      { name: 'Dorper', gestationDays: 147 },
      { name: 'Suffolk', gestationDays: 147 },
      { name: 'Merino', gestationDays: 150 },
      { name: 'Katahdin', gestationDays: 147 },
    ],
    careTemplates: [
      { name: 'Hoof Trim', type: 'careRecurring', cycle: 42, healthRecordType: '' },
      { name: 'Shearing', type: 'careRecurring', cycle: 180, healthRecordType: '' },
      { name: 'Deworming', type: 'careRecurring', cycle: 90, healthRecordType: 'deworming' },
      { name: 'CDT Vaccination', type: 'careRecurring', cycle: 365, healthRecordType: 'vaccination' },
    ],
  },
  'Pig': {
    colors: ['Pink', 'Black', 'Spotted', 'Red'],
    breeds: [
      { name: 'Berkshire', gestationDays: 114 },
      { name: 'Hampshire', gestationDays: 114 },
      { name: 'Duroc', gestationDays: 114 },
      { name: 'Yorkshire', gestationDays: 114 },
      { name: 'Kunekune', gestationDays: 116 },
    ],
    careTemplates: [
      { name: 'Deworming', type: 'careRecurring', cycle: 90, healthRecordType: 'deworming' },
      { name: 'Iron Shot (piglets)', type: 'careSingle', cycle: 0, healthRecordType: 'medication' },
    ],
  },
  'Rabbit': {
    colors: ['White', 'Black', 'Brown', 'Gray', 'Spotted'],
    breeds: [
      { name: 'New Zealand', gestationDays: 31 },
      { name: 'Californian', gestationDays: 31 },
      { name: 'Rex', gestationDays: 31 },
      { name: 'Flemish Giant', gestationDays: 32 },
    ],
    careTemplates: [
      { name: 'Nail Trim', type: 'careRecurring', cycle: 30, healthRecordType: '' },
      { name: 'Cage Cleaning', type: 'careRecurring', cycle: 7, healthRecordType: '' },
    ],
  },
  'Horse': {
    colors: ['Bay', 'Chestnut', 'Black', 'Gray', 'Palomino', 'Paint'],
    breeds: [
      { name: 'Quarter Horse', gestationDays: 340 },
      { name: 'Thoroughbred', gestationDays: 340 },
      { name: 'Arabian', gestationDays: 340 },
      { name: 'Morgan', gestationDays: 340 },
    ],
    careTemplates: [
      { name: 'Farrier Visit', type: 'careRecurring', cycle: 42, healthRecordType: '' },
      { name: 'Deworming', type: 'careRecurring', cycle: 60, healthRecordType: 'deworming' },
      { name: 'Dental Float', type: 'careRecurring', cycle: 365, healthRecordType: 'vetVisit' },
      { name: 'Vaccination (4-way)', type: 'careRecurring', cycle: 365, healthRecordType: 'vaccination' },
    ],
  },
  'Duck': {
    colors: ['White', 'Brown', 'Black', 'Blue'],
    breeds: [
      { name: 'Pekin' },
      { name: 'Khaki Campbell' },
      { name: 'Muscovy' },
      { name: 'Runner' },
    ],
    careTemplates: [
      { name: 'Pool Cleaning', type: 'careRecurring', cycle: 3, healthRecordType: '' },
      { name: 'Deworming', type: 'careRecurring', cycle: 90, healthRecordType: 'deworming' },
    ],
  },
}
