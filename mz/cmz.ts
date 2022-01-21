import { searchMZDB, insertMZDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';
import { randomNum } from '../dice/dice.ts';

export class Cmz {
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
    const time = Date.now();
    // console.log(self, group);
    const data = await searchMZDB(self, group);
    if (data && dayjs(time).isSame(dayjs(data.cmz_time),'day')) {
      // 已经抽过
      return `${await cqmsg.atstring(self, group)}  你已经抽过闷砖了！目前你有${data.total}块闷砖。`;
    } else {
      const number = randomNum(10);
      let floorNum = 0;
      if (data?.floor && data.floor === 1) {
        floorNum = 1;
      }
      if (data?.floor && data.floor > 1) {
        floorNum = randomNum(data.floor);
      }
      let total = number;
      if (data && data.total) {
        total = total + data.total + floorNum;
      }
      const mzdata = {
        user_id: self,
        group_id: group,
        total: total,
        cmz_time: time,
      }
      await insertMZDB(mzdata);
      
      return `${await cqmsg.atstring(self, group)}  呐~刚烧好的${number}块闷砖🧱，房子今日产出${floorNum}块闷砖🧱，目前你有${total}块闷砖。`
    }
  }
}