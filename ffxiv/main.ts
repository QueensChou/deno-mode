import { Dice } from '../dice/dice.ts';
import { DBclient } from '../src/db.ts';
const response = await fetch(new URL("./data.json", import.meta.url));
const ffxivData:FFDATA = await response.json();

interface FFDATA {
  total: number,
  city: string [],
  npc: {
    name: string,
    buff: string,
    type: number,
  } [],
  enemy: {
    name: string,
    att: number,
    buff: string,
  } [],
  pet: {
    name: string,
    buff: number
  } []
}

export class FFXIV {
  private name = 'ffxiv';
  private regName = /^\/ffxiv\s+(?<param>.*)$/;
  private regParam = /^(?<order>(go|status|city)?)\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = '参数错误! go为执行一次行动，status为查看自身状态，city为查看目前城市所有者!';

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      console.log(param);
      return this.paramError;
    }
  }

  public runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const self = arrCmd?.groups?.self;
    const group = arrCmd?.groups?.group;
    const order = arrCmd?.groups?.order ? arrCmd?.groups?.order : 'go';
    console.log(order, self, group);
    if (self !== undefined && group !== undefined) {
      switch (order) {
        case 'go':
          this.go(self, group);
          break;
      
        default:
          break;
      }
    } else {
      console.log('数据错误');
    }
  }

  private async go(self:string, group:string) {
    console.log(`来自${group}的${self}行动`);
    await DBclient.execute(`USE enok`);
    const dice = new Dice();
    dice.quantity = 1;
    dice.surface = ffxivData.total;
  }
}