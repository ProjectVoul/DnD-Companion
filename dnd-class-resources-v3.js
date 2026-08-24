/* Class resources tracker. Values follow 2014 class progression; optional subclass resources remain data-driven. */
(() => {
  'use strict';
  const E=window.DnDEngineV3||window.DnDEngineV2,D=window.DnDDataV2;if(!E||!D)return;
  const maxFor=(cl,id)=>{const l=Number(cl.level)||0,cha=Math.max(1,E.abilityMod(E.state,'charisma'));switch(id){case'rage':return l>=17?6:l>=12?5:l>=6?4:l>=3?3:2;case'ki':case'sorcery-points':return l;case'bardic-inspiration':return cha;case'second-wind':return 1;case'action-surge':return l>=17?2:1;case'lay-on-hands':return l*5;case'channel-divinity':return l>=18?3:l>=6?2:1;case'wild-shape':return 2;default:return 1;}};
  function resources(c=E.state){const out=[];(c.classes||[]).forEach(cl=>{const rules=D.CLASS_RULES?.[cl.classId]?.resources||{};Object.keys(rules).forEach(id=>out.push({id,classId:cl.classId,name:id.replace(/-/g,' '),maximum:maxFor(cl,id),recovery:id==='ki'||id==='sorcery-points'||id==='rage'?'longRest':'shortRest'}));});return out;}
  E.classResources=resources;
  const oldSummary=E.summary;E.summary=c=>({...oldSummary(c),classResources:resources(c)});
  window.DnDClassResourcesV3={resources};
})();