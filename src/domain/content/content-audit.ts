import {CLASS_FEATURES} from './class-features';
import {FEATURE_DESCRIPTIONS} from './feature-descriptions';
import {SPELLS} from './spells';
import {PALADIN_SPELLS} from './paladin-spells';
import {FEATS} from './feats';
import {BACKGROUNDS} from './backgrounds';

export type ContentAudit={
  featureIds:string[];
  featuresMissingDescription:string[];
  orphanFeatureDescriptions:string[];
  spellsMissingDescription:string[];
  spellsMissingSource:string[];
  featsMissingDescription:string[];
  backgroundsMissingDescription:string[];
};

export function auditContent():ContentAudit{
  const features=Object.values(CLASS_FEATURES).flat();
  const featureIds=features.map(f=>f.id);
  const descriptions=FEATURE_DESCRIPTIONS;
  const featuresMissingDescription=featureIds.filter(id=>!descriptions[id]);
  const featureSet=new Set(featureIds);
  const orphanFeatureDescriptions=Object.keys(descriptions).filter(id=>!featureSet.has(id));
  const allSpells=[...SPELLS,...PALADIN_SPELLS.filter(extra=>!SPELLS.some(base=>base.id===extra.id))];
  const spellsMissingDescription=allSpells.filter(s=>!s.description?.trim()).map(s=>s.id);
  const spellsMissingSource=allSpells.filter(s=>!s.source?.trim()).map(s=>s.id);
  const featsMissingDescription=FEATS.filter(f=>!f.description?.trim()||f.description==='Description not yet populated.').map(f=>f.id);
  const backgroundsMissingDescription=BACKGROUNDS.filter(b=>!b.description?.trim()).map(b=>b.id);
  return {featureIds,featuresMissingDescription,orphanFeatureDescriptions,spellsMissingDescription,spellsMissingSource,featsMissingDescription,backgroundsMissingDescription};
}
