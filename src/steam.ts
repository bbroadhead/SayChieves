export type Achievement = {id:string;name:string;description:string;icon?:string;globalPercent?:number;earned:boolean;hidden?:boolean};
export type Progress = {earned:number;total:number;achievements:Achievement[]};
type AnyObj=Record<string,any>;
const w=window as unknown as AnyObj;
function arrayOf(value:any):any[] {return Array.isArray(value)?value:Array.isArray(value?.achievements)?value.achievements:Array.isArray(value?.rgAchievements)?value.rgAchievements:[];}
export async function readAchievements(appId:number):Promise<Progress|null>{
  if(!Number.isSafeInteger(appId)||appId<=0)return null;
  const api=w.SteamClient?.Achievements;
  if(!api)return null;
  // Client interfaces vary between Steam versions; only call functions actually present.
  const methods=['GetAchievementsForApp','GetAchievementProgress','GetAchievements'];
  for(const name of methods){
    if(typeof api[name]!=='function')continue;
    try {
      const result=await api[name](appId);
      const list=arrayOf(result);
      if(!list.length)continue;
      const achievements:Achievement[]=list.map((a:any,i:number)=>({
        id:String(a.strID??a.id??a.name??i),
        name:String(a.strName??a.displayName??a.name??'Unknown achievement'),
        description:String(a.strDescription??a.description??''),
        icon:typeof (a.strIcon??a.icon)==='string'?(a.strIcon??a.icon):undefined,
        globalPercent:Number.isFinite(Number(a.flGlobalPercentage??a.globalPercent))?Number(a.flGlobalPercentage??a.globalPercent):undefined,
        earned:Boolean(a.bAchieved??a.achieved??a.unlocked),
        hidden:Boolean(a.bHidden??a.hidden)
      }));
      return {earned:achievements.filter(a=>a.earned).length,total:achievements.length,achievements};
    }catch(error){console.debug('[SayChieves] achievement API attempt failed',name,error);}
  }
  return null;
}
