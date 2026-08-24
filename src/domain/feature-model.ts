import type {Feature} from './types';
export interface FeatureEffect{type:'modifier'|'proficiency'|'expertise'|'resource'|'spell'|'resistance'|'action'|'choice';key:string;value?:number|string|boolean;}
export interface FeatureDefinition extends Feature{sourceBook:'phb2014'|'xge2017'|'tasha2020'|'homebrew';classId?:string;subclassId?:string;prerequisiteLevel?:number;effects?:FeatureEffect[];choiceGroup?:string;}
export interface OptionalFeatureChoice{featureId:string;enabled:boolean;replaces?:string;}
export function featureAvailable(f:FeatureDefinition,level:number,enabledSources:Set<string>){return level>=(f.prerequisiteLevel??f.level)&&enabledSources.has(f.sourceBook);}
