import { searchMZDB, insertMZDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';
import { randomNum } from '../dice/dice.ts';

class Cmz {
  private name = 'cmz';
  private regName = /^cmz\s*(?<param>.*)$/;
  private regParam = /^(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `该指令无需任何参数！`;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      // console.log(param);
      return this.paramError;
    }
  }

  public async runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const self = Number(arrCmd?.groups?.self);
    const group = Number(arrCmd?.groups?.group);
    // console.log(self, group);
    const defaultData = {
      user_id: self,
      group_id: group,
      total: 20,
      floor: 10,
      cmz_time: 0,
    }
    const data = await searchMZDB(self, group);
    if (data) {
      defaultData.total = data.total as number;
      defaultData.floor = data.floor as number;
      defaultData.cmz_time = data.cmz_time as number;
    }
    if (dayjs().isSame(dayjs(defaultData.cmz_time),'day')) {
      // 已经抽过
      return `${await cqmsg.atstring(self, group)}  你已经抽过闷砖了！目前你有${defaultData.total}块闷砖。`;
    } else {
      defaultData.cmz_time = Date.now();
      const number = randomNum(10);
      let floorNum = 0;
      if (defaultData.floor === 1) {
        floorNum = 1;
      }
      if (defaultData.floor > 1) {
        floorNum = randomNum(defaultData.floor);
      }
      defaultData.total = defaultData.total + number + floorNum;
      await insertMZDB(defaultData);
      
      return `${await cqmsg.atstring(self, group)}  呐~刚烧好的${number}块闷砖🧱，房子今日产出${floorNum}块闷砖🧱，目前你有${defaultData.total}块闷砖。`;
    }
  }
}

export const cmz = new Cmz();