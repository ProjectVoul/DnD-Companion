export type ContentSourceId='phb2014'|'xanathar2017'|'tasha2020'|'homebrew';
export interface ContentSource{id:ContentSourceId;name:string;required:boolean;enabledByDefault:boolean;optional:boolean;description:string;}
export const CONTENT_SOURCES:ContentSource[]=[
 {id:'phb2014',name:"Player's Handbook 2014",required:true,enabledByDefault:true,optional:false,description:'Core character rules and content.'},
 {id:'xanathar2017',name:"Xanathar's Guide to Everything",required:false,enabledByDefault:true,optional:true,description:'Optional character options, subclasses and rules expansions.'},
 {id:'tasha2020',name:"Tasha's Cauldron of Everything",required:false,enabledByDefault:false,optional:true,description:'Optional class features, subclasses, feats, spells and artificer content.'},
 {id:'homebrew',name:'Homebrew',required:false,enabledByDefault:true,optional:true,description:'Player/DM-created content; never silently treated as official.'}
];
export const CONTENT_SOURCE_MAP=Object.fromEntries(CONTENT_SOURCES.map(source=>[source.id,source])) as Record<ContentSourceId,ContentSource>;
export interface CharacterContentOptions{enabledSources:ContentSourceId[];allowHomebrew:boolean;optionalClassFeatures:Record<string,boolean>;}
export const DEFAULT_CONTENT_OPTIONS:CharacterContentOptions={enabledSources:CONTENT_SOURCES.filter(source=>source.enabledByDefault).map(source=>source.id),allowHomebrew:true,optionalClassFeatures:{}};
export function enabledContentSources(ids?:string[]){
 const requested=ids??DEFAULT_CONTENT_OPTIONS.enabledSources;
 const enabled=new Set<ContentSourceId>(requested.filter((id):id is ContentSourceId=>id in CONTENT_SOURCE_MAP));
 CONTENT_SOURCES.filter(source=>source.required).forEach(source=>enabled.add(source.id));
 return enabled;
}
export function isContentSourceEnabled(ids:string[]|undefined,source:string){return enabledContentSources(ids).has(source as ContentSourceId);}
