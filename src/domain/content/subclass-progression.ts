import type {Feature} from '../types';
import {ALL_SUBCLASSES} from './subclass-registry';
import {SUBCLASS_FEATURES} from './subclassFeatures';
import {EXPANSION_SUBCLASS_FEATURES} from './expansionSubclassFeatures';
import {TASHA_SUBCLASS_FEATURES} from './tashaSubclassFeatures';
import {XANATHAR_SUBCLASS_FEATURES} from './xanatharSubclassFeatures';

const FEATURE_LEVELS: Record<string, number[]> = {
  barbarian:[3,6,10,14],bard:[3,6,14],cleric:[1,2,6,8,17],druid:[2,6,10,14],fighter:[3,7,10,15,18],
  monk:[3,6,11,17],paladin:[3,7,15,20],ranger:[3,7,11,15],rogue:[3,9,13,17],sorcerer:[1,6,14,18],
  warlock:[1,6,10,14],wizard:[2,6,10,14],artificer:[3,5,9,15],
};

const CANONICAL_SUBCLASS_FEATURES=[...SUBCLASS_FEATURES,...EXPANSION_SUBCLASS_FEATURES,...TASHA_SUBCLASS_FEATURES,...XANATHAR_SUBCLASS_FEATURES];
const matchesSubclass=(featureSubclassId:string,classId:string,subclassId:string)=>featureSubclassId===subclassId||featureSubclassId===`${classId}.${subclassId}`;
export interface SubclassFeatureSlot{classId:string;subclassId:string;level:number;id:string;name:string}
export const SUBCLASS_FEATURE_SLOTS:SubclassFeatureSlot[]=Object.entries(ALL_SUBCLASSES).flatMap(([classId,subclasses])=>(subclasses as {id:string;name:string}[]).flatMap(subclass=>(FEATURE_LEVELS[classId]??[]).map(level=>({classId,subclassId:subclass.id,level,id:`subclass:${classId}:${subclass.id}:${level}`,name:`${subclass.name} Feature`}))));
export const subclassFeatureSlots=(classId:string,subclassId:string)=>SUBCLASS_FEATURE_SLOTS.filter(f=>f.classId===classId&&f.subclassId===subclassId);
export const subclassFeaturesFor=(classId:string,subclassId:string,level:number):Feature[]=>{const allowed=FEATURE_LEVELS[classId]??[];return CANONICAL_SUBCLASS_FEATURES.filter(feature=>matchesSubclass(feature.subclassId,classId,subclassId)&&feature.level<=level&&allowed.includes(feature.level));};
export const subclassFeaturesAtLevel=(classId:string,subclassId:string,level:number):Feature[]=>CANONICAL_SUBCLASS_FEATURES.filter(feature=>matchesSubclass(feature.subclassId,classId,subclassId)&&feature.level===level&&(FEATURE_LEVELS[classId]??[]).includes(level));
export const subclassFeaturePlaceholders=(classId:string,subclassId:string):Feature[]=>subclassFeatureSlots(classId,subclassId).filter(slot=>!CANONICAL_SUBCLASS_FEATURES.some(feature=>matchesSubclass(feature.subclassId,classId,subclassId)&&feature.level===slot.level)).map(slot=>({id:slot.id,name:slot.name,source:'subclass',level:slot.level}));