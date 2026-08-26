import {SPELLS} from './spells';

/** Canonical PHB-2014 coverage registry. Keep entries source-verified before adding them. */
export const PHB_SPELL_COVERAGE:Record<number,string[]>={
  0:[],1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]
};

export function getMissingPhbSpellIds():string[]{
  const expected=new Set(Object.values(PHB_SPELL_COVERAGE).flat());
  const actual=new Set(SPELLS.filter(s=>s.source==='phb2014').map(s=>s.id));
  return [...expected].filter(id=>!actual.has(id));
}

export function getUnexpectedPhbSpellIds():string[]{
  const expected=new Set(Object.values(PHB_SPELL_COVERAGE).flat());
  return SPELLS.filter(s=>s.source==='phb2014'&&!expected.has(s.id)).map(s=>s.id);
}
