import type {Feature} from '../types';
import {SUBCLASS_FEATURES} from './subclass-features';

/** Canonical universal access point for concrete subclass features. */
export function getSubclassFeatures(classId:string, subclassId:string, level:number, enabledSources:Set<string>):Feature[]{
  const key=`${classId}:${subclassId}`;
  return (SUBCLASS_FEATURES[key]??[]).filter(feature=>feature.level<=level&&enabledSources.has(feature.sourceBook??'phb2014'));
}

export function hasCompleteSubclassFeatures(classId:string, subclassId:string):boolean{
  return (SUBCLASS_FEATURES[`${classId}:${subclassId}`]??[]).every(feature=>Boolean(feature.description));
}
