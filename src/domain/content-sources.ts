import {CONTENT_SOURCES} from './content/sources';
import type {ContentSourceId} from './content/sources';

export type {ContentSourceId,ContentSource} from './content/sources';
export {CONTENT_SOURCES} from './content/sources';

export const CONTENT_SOURCE_MAP=Object.fromEntries(CONTENT_SOURCES.map(source=>[source.id,source])) as Record<ContentSourceId,(typeof CONTENT_SOURCES)[number]>;

export interface CharacterContentOptions{
 enabledSources:ContentSourceId[];
 allowHomebrew:boolean;
 optionalClassFeatures:Record<string,boolean>;
}

export const DEFAULT_CONTENT_OPTIONS:CharacterContentOptions={
 enabledSources:CONTENT_SOURCES.filter(source=>source.enabledByDefault).map(source=>source.id),
 allowHomebrew:true,
 optionalClassFeatures:{}
};

export function enabledContentSources(ids?:string[]){
 const requested=ids??DEFAULT_CONTENT_OPTIONS.enabledSources;
 const enabled=new Set<ContentSourceId>(requested.filter((id):id is ContentSourceId=>id in CONTENT_SOURCE_MAP));
 CONTENT_SOURCES.filter(source=>source.required).forEach(source=>enabled.add(source.id));
 return enabled;
}

export function isContentSourceEnabled(ids:string[]|undefined,source:string){
 return enabledContentSources(ids).has(source as ContentSourceId);
}
