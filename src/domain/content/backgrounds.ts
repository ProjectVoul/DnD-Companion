import type {BackgroundData,Skill} from '../types';
type B=BackgroundData&{id:string;skills:Skill[]};
export const BACKGROUNDS:B[]=[
{id:'acolyte',name:'Acolyte',skills:['insight','religion'],skillProficiencies:['Insight','Religion'],toolProficiencies:[],languages:['2 languages'],feature:'Shelter of the Faithful'},
{id:'charlatan',name:'Charlatan',skills:['deception','sleightOfHand'],skillProficiencies:['Deception','Sleight of Hand'],toolProficiencies:['Disguise kit','Forgery kit'],languages:[],feature:'False Identity'},
{id:'criminal',name:'Criminal',skills:['deception','stealth'],skillProficiencies:['Deception','Stealth'],toolProficiencies:["Thieves' tools","Gaming set"],languages:[],feature:'Criminal Contact'},
{id:'entertainer',name:'Entertainer',skills:['acrobatics','performance'],skillProficiencies:['Acrobatics','Performance'],toolProficiencies:['Disguise kit','One musical instrument'],languages:[],feature:'By Popular Demand'},
{id:'folk-hero',name:'Folk Hero',skills:['animalHandling','survival'],skillProficiencies:['Animal Handling','Survival'],toolProficiencies:["Artisan's tools","Vehicles (land)"],languages:[],feature:'Rustic Hospitality'},
{id:'guild-artisan',name:'Guild Artisan',skills:['insight','persuasion'],skillProficiencies:['Insight','Persuasion'],toolProficiencies:["Artisan's tools"],languages:['1 language'],feature:'Guild Membership'},
{id:'hermit',name:'Hermit',skills:['medicine','religion'],skillProficiencies:['Medicine','Religion'],toolProficiencies:['Herbalism kit'],languages:['1 language'],feature:'Discovery'},
{id:'noble',name:'Noble',skills:['history','persuasion'],skillProficiencies:['History','Persuasion'],toolProficiencies:['Gaming set'],languages:['1 language'],feature:'Position of Privilege'},
{id:'outlander',name:'Outlander',skills:['athletics','survival'],skillProficiencies:['Athletics','Survival'],toolProficiencies:['One musical instrument'],languages:['1 language'],feature:'Wanderer'},
{id:'sage',name:'Sage',skills:['arcana','history'],skillProficiencies:['Arcana','History'],toolProficiencies:[],languages:['2 languages'],feature:'Researcher'},
{id:'sailor',name:'Sailor',skills:['athletics','perception'],skillProficiencies:['Athletics','Perception'],toolProficiencies:["Navigator's tools","Vehicles (water)"],languages:[],feature:'Ship’s Passage'},
{id:'soldier',name:'Soldier',skills:['athletics','intimidation'],skillProficiencies:['Athletics','Intimidation'],toolProficiencies:['Gaming set','Vehicles (land)'],languages:[],feature:'Military Rank'},
{id:'urchin',name:'Urchin',skills:['sleightOfHand','stealth'],skillProficiencies:['Sleight of Hand','Stealth'],toolProficiencies:['Disguise kit',"Thieves' tools"],languages:[],feature:'City Secrets'}
];
