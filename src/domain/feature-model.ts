import type {Feature} from './types';
import type {ContentSourceId} from './content-sources';
export interface FeatureEffect{type:'modifier'|'proficiency'|'expertise'|'resource'|'spell'|'resistance'|'action'|'choice';key:string;value?:number|string|boolean;}
export interface FeatureDefinition extends Omit<Feature,'effects'>{sourceBook:ContentSourceId;classId?:string;subclassId?:string;prerequisiteLevel?:number;effects?:FeatureEffect[];choiceGroup?:string;}
export interface OptionalFeatureChoice{featureId:string;enabled:boolean;replaces?:string;}
export function featureAvailable(f:FeatureDefinition,level:number,enabledSources:Set<ContentSourceId>){return level>=(f.prerequisiteLevel??f.level)&&enabledSources.has(f.sourceBook);}
