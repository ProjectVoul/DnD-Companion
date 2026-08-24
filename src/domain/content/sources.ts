export type ContentSourceId='phb2014'|'xanathar2017'|'tasha2020'|'homebrew';
export interface ContentSource{id:ContentSourceId;name:string;required:boolean;enabledByDefault:boolean;description:string}
export const CONTENT_SOURCES:ContentSource[]=[
{id:'phb2014',name:"Player's Handbook 2014",required:true,enabledByDefault:true,description:'Core character rules and content.'},
{id:'xanathar2017',name:"Xanathar's Guide to Everything",required:false,enabledByDefault:false,description:'Optional subclasses, spells and character options.'},
{id:'tasha2020',name:"Tasha's Cauldron of Everything",required:false,enabledByDefault:false,description:'Optional class features, subclasses, spells, feats and artificer.'},
{id:'homebrew',name:'Homebrew',required:false,enabledByDefault:true,description:'Player/DM-created content; never silently treated as official.'}
];
