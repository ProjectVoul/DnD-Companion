import type {Feature} from '../types';

/**
 * Concrete subclass feature records. Names/levels are kept separate from the
 * universal progression registry so a subclass can expose multiple features
 * at the same level without inventing placeholder features.
 * Sources: Xanathar (2014 PHB companion options) and Tasha, as supplied.
 */
const F=(id:string,name:string,level:number,sourceBook:'xanathar2017'|'tasha2020',description?:string,activation:Feature['activation']='special'):Feature=>({id,name,source:'subclass',sourceBook,level,description,activation});

export const SUBCLASS_FEATURES:Record<string,Feature[]>={
 'bard:swords':[
  F('bard:swords:bonus-proficiencies','Competenze Bonus',3,'xanathar2017','Al 3° livello ottieni competenza nelle armature medie e nella scimitarra. Un’arma da mischia semplice o da guerra con cui sei competente può essere usata come focus da incantatore per i tuoi incantesimi da bardo.','passive'),
  F('bard:swords:fighting-style','Stile di Combattimento',3,'xanathar2017','Al 3° livello scegli uno stile di combattimento tra Duellare e Combattere con Due Armi. Non puoi scegliere una stessa opzione più di una volta.','passive'),
  F('bard:swords:blade-flourish','Virtuosismo della Lama',3,'xanathar2017','Quando effettui l’azione di Attacco, la tua velocità sul terreno aumenta di 3 metri fino alla fine del turno. Se un attacco con un’arma colpisce, puoi spendere un uso di Ispirazione Bardica per applicare un’opzione di Virtuosismo della Lama; puoi usarne solo una per turno.','special'),
  F('bard:swords:extra-attack','Attacco Extra',6,'xanathar2017','Puoi attaccare due volte, invece di una, ogni volta che effettui l’azione di Attacco durante il tuo turno.','passive'),
  F('bard:swords:masters-flourish','Virtuosismo del Maestro',14,'xanathar2017','Quando usi un’opzione di Virtuosismo della Lama, puoi tirare un d6 e usarlo invece di spendere un dado di Ispirazione Bardica.','special')
 ],
 'artificer:battle-smith':[
  F('artificer:battle-smith:tool-proficiency','Competenza negli Strumenti',3,'tasha2020','Ottieni competenza negli strumenti da fabbro; se la possiedi già, scegli un altro tipo di strumenti da artigiano.','passive'),
  F('artificer:battle-smith:spells','Incantesimi da Fabbro da Battaglia',3,'tasha2020','Ottieni sempre preparati gli incantesimi indicati dalla tabella del Fabbro da Battaglia. Questi incantesimi contano come incantesimi da artefice ma non come parte del numero di incantesimi da artefice preparati.','special'),
  F('artificer:battle-smith:ready-for-battle','Pronto per la Battaglia',3,'tasha2020','Ottieni competenza nelle armi da guerra. Quando attacchi con un’arma magica puoi usare il modificatore di Intelligenza, invece di Forza o Destrezza, per i tiri per colpire e per i danni.','passive'),
  F('artificer:battle-smith:steel-defender','Difensore d’Acciaio',3,'tasha2020','Crei un difensore d’acciaio che ti accompagna e ti protegge. Condivide la tua iniziativa e richiede normalmente un’azione bonus per ricevere ordini di combattimento.','special'),
  F('artificer:battle-smith:extra-attack','Attacco Extra',5,'tasha2020','Puoi attaccare due volte, invece di una, ogni volta che effettui l’azione di Attacco durante il tuo turno.','passive'),
  F('artificer:battle-smith:arcane-jolt','Scossa Arcana',9,'tasha2020','Quando colpisci con un’arma magica, o il tuo difensore d’acciaio colpisce, puoi incanalare energia per infliggere 2d6 danni da forza extra oppure ripristinare 2d6 punti ferita a una creatura o oggetto entro 9 metri dal bersaglio. Puoi usarla un numero di volte pari al modificatore di Intelligenza, minimo una volta, recuperando gli utilizzi con un riposo lungo.','special'),
  F('artificer:battle-smith:improved-defender','Difensore Migliorato',15,'tasha2020','La Scossa Arcana e il Difensore d’Acciaio diventano più potenti: i dadi di Scossa Arcana aumentano a 4d6, il difensore ottiene +2 alla CA e la sua Devia Attacco infligge danni da forza aggiuntivi.','passive')
 ],
 'wizard:bladesinging':[
  F('wizard:bladesinging:training','Addestramento alla Guerra e al Canto della Lama',2,'tasha2020','Ottieni le competenze e l’addestramento previsti dal Canto della Lama.','passive'),
  F('wizard:bladesinging:blade-song','Melodia della Lama',2,'tasha2020','Come azione bonus attivi una Melodia della Lama. Mentre è attiva ottieni bonus alla CA pari al modificatore di Intelligenza (minimo +1), +3 metri alla velocità, vantaggio ad Acrobazia e un bonus ai tiri salvezza di Costituzione per mantenere la concentrazione pari al modificatore di Intelligenza (minimo +1). Gli utilizzi sono pari al bonus di competenza e si recuperano con un riposo lungo.','bonus-action'),
  F('wizard:bladesinging:extra-attack','Attacco Extra',6,'tasha2020','Puoi attaccare due volte quando effettui l’azione di Attacco e puoi sostituire uno degli attacchi con un trucchetto.','passive'),
  F('wizard:bladesinging:song-of-defense','Canzone di Difesa',10,'tasha2020','Quando subisci danni mentre la Melodia della Lama è attiva, puoi usare la reazione e spendere uno slot incantesimo per ridurre i danni di cinque volte il livello dello slot.','reaction'),
  F('wizard:bladesinging:song-of-victory','Canzone di Vittoria',14,'tasha2020','Mentre la Melodia della Lama è attiva, puoi aggiungere il modificatore di Intelligenza (minimo +1) ai danni dei tuoi attacchi con armi da mischia.','passive')
 ],
 'wizard:order-of-scribes':[
  F('wizard:order-of-scribes:quill','Calamo Incantato',2,'tasha2020','Come azione bonus puoi creare magicamente un pennino che non richiede inchiostro. Usandolo per copiare un incantesimo nel libro degli incantesimi, riduci il tempo di trascrizione a 2 minuti per livello dell’incantesimo.','bonus-action'),
  F('wizard:order-of-scribes:awakened-spellbook','Libro degli Incantesimi Risvegliato',2,'tasha2020','Il libro può essere usato come focus da incantatore e ti consente di sostituire il tipo di danno di un incantesimo con un tipo presente in un altro incantesimo dello stesso livello nel libro. Inoltre puoi lanciare rituali usando il normale tempo di lancio una volta per riposo lungo.','special'),
  F('wizard:order-of-scribes:manifest-mind','Mente Manifestata',6,'tasha2020','Puoi evocare la mente del tuo Libro degli Incantesimi Risvegliato.','bonus-action'),
  F('wizard:order-of-scribes:master-scrivener','Scrivano Arcano',10,'tasha2020','Al termine di un riposo lungo puoi creare una pergamena magica di un incantesimo di 1° o 2° livello con il Calamo Incantato.','special'),
  F('wizard:order-of-scribes:one-with-the-word','Comunione con il Testo',14,'tasha2020','Finché hai con te il libro ottieni vantaggio alle prove di Intelligenza (Arcano) e puoi usare la reazione per evitare interamente i danni mentre la Mente Manifestata è attiva, con le conseguenze previste dalla regola.','reaction')
 ],
 'paladin:glory':[
  F('paladin:glory:spells-channel','Incantesimi di Giuramento e Incanalare Divinità',3,'tasha2020','Ottieni gli incantesimi di giuramento ai livelli indicati e due opzioni di Incanalare Divinità: Atleta Impareggiabile e Punizione Ispiratrice.','special'),
  F('paladin:glory:aura-of-alacrity','Aura di Alacrità',7,'tasha2020','La tua velocità base aumenta di 3 metri. Un alleato che inizia il proprio turno entro 1,5 metri da te ottiene 3 metri di velocità aggiuntiva fino alla fine del turno, se non sei incapacitato.','passive'),
  F('paladin:glory:glorious-defense','Difesa Gloriosa',15,'tasha2020','Ottieni il privilegio di difenderti e dei tuoi alleati secondo le regole del Giuramento di Gloria.','reaction'),
  F('paladin:glory:living-legend','Leggenda Vivente',20,'tasha2020','Raggiungi il culmine del Giuramento di Gloria e ottieni i benefici della relativa trasformazione per 1 minuto.','special')
 ]
};

export function subclassFeatures(classId:string,subclassId:string):Feature[]{return SUBCLASS_FEATURES[`${classId}:${subclassId}`]??[];}
