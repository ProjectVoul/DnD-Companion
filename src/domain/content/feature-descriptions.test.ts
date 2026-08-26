import {strict as assert} from 'node:assert';
import {CLASS_PROGRESSION} from './class-progression';
import {FEATURE_DESCRIPTIONS} from './feature-descriptions';

const placeholder=(id:string)=>/:(asi(?:-|$)|path-feature|archetype-|college-feature|tradition-|origin-|patron-|oath-feature|specialist-|martial-archetype|monastic-tradition|roguish-archetype|ranger-archetype|sacred-oath|druid-circle|bard-college|primal-path|sorcerous-origin|arcane-tradition|artificer-specialist)/.test(id);
for(const [classId,features] of Object.entries(CLASS_PROGRESSION)){
  for(const feature of features){
    if(placeholder(feature.id)) continue;
    const key=feature.id.split(':').slice(0,2).join(':');
    assert.ok(FEATURE_DESCRIPTIONS[key],`Missing feature description: ${feature.id}`);
  }
}
console.log('Feature description coverage passed');
