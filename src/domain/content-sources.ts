export type ContentSourceId='phb2014'|'xge2017'|'tasha2020'|'homebrew';
export interface ContentSource{ id:ContentSourceId; name:string; enabledByDefault:boolean; optional:boolean; }
export const CONTENT_SOURCES:Record<ContentSourceId,ContentSource>={
 phb2014:{id:'phb2014',name:"Player's Handbook 2014",enabledByDefault:true,optional:false},
 xge2017:{id:'xge2017',name:"Xanathar's Guide to Everything",enabledByDefault:true,optional:false},
 tasha2020:{id:'tasha2020',name:'Tasha’s Cauldron of Everything',enabledByDefault:false,optional:true},
 homebrew:{id:'homebrew',name:'Homebrew',enabledByDefault:true,optional:true},
};
export interface CharacterContentOptions{enabledSources:ContentSourceId[];allowHomebrew:boolean;optionalClassFeatures:Record<string,boolean>;}
export const DEFAULT_CONTENT_OPTIONS:CharacterContentOptions={enabledSources:['phb2014','xge2017'],allowHomebrew:true,optionalClassFeatures:{}};
