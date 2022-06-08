import { orderDB } from '../src/db.ts';
import { cqmsg } from '../src/cqmsg.ts';

class Ranks {
  private name = 'rank';
  private regName = /^rank\s*(?<param>.*)$/;
  private regParam = /^(?<order>(total|floor))\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `参数错误! total为闷砖总数榜，floor为楼层榜!`;

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

  public async runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const self = Number(arrCmd?.groups?.self);
    const group = Number(arrCmd?.groups?.group);
    const order = (arrCmd?.groups?.order ? arrCmd?.groups?.order : 'total') as 'total'|'floor';
    let str = '没有查到任何数据!';
    // console.log(order, self, group);
    if (self !== undefined && group !== undefined) {
      const data = await orderDB({group_id:group}, 'mzdata', order) as unknown as MZList[];
      // console.log(data);
      if (data.length > 0) {
        str = '榜单如下：'
        for (const [index, elem] of data.entries()) {
          if (index > 4) break;
          str = str + `\n${await cqmsg.atstring(elem.user_id, elem.group_id)} ${elem[order]} ${order === 'total' ? '块闷砖' : '层'}`;
        }
      }
      return str;
    } else {
      return '数据错误';
    }
  }
}

export const rank = new Ranks();