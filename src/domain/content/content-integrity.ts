import {PHB_SPECIES_IDS,isPhbSpecies} from './species-mechanics';

export const assertUniqueIds = (ids:string[], label:string):void => {
  const seen = new Set<string>();
  const duplicates = ids.filter(id => seen.has(id) || !seen.add(id));
  if (duplicates.length) throw new Error(`${label} contains duplicate ids: ${[...new Set(duplicates)].join(', ')}`);
};

export const validatePhbSpeciesCatalog = (ids:string[]):void => {
  assertUniqueIds(ids,'PHB species');
  for (const id of PHB_SPECIES_IDS) {
    if (!ids.includes(id)) throw new Error(`Missing PHB species: ${id}`);
  }
  for (const id of ids) {
    if (!isPhbSpecies(id)) throw new Error(`Unknown PHB species id: ${id}`);
  }
};