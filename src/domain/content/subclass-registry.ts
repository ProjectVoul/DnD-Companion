import {SUBCLASSES} from '../catalog';
import {EXPANSION_SUBCLASSES} from './subclasses';
export const ALL_SUBCLASSES=Object.fromEntries(Object.keys({...SUBCLASSES,...EXPANSION_SUBCLASSES}).map(classId=>[classId,[...(SUBCLASSES[classId]??[]),...(EXPANSION_SUBCLASSES[classId]??[])]]));
