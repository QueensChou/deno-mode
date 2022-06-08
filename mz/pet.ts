import { insertMZDB } from '../src/db.ts';
import { cqmsg } from '../src/cqmsg.ts';

class PetName {
  private name = 'petname';
  private regName = /^petname\s*(?<param>.*)$/;
  private regParam = /^(?<name>\S+)\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `请设置正确的宠物名称，不能存在空格字符！`;

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
    const petname = arrCmd?.groups?.name;
    if (petname) {
      await insertMZDB({
        user_id: self,
        group_id: group,
        petname: petname,
      });
      return `${await cqmsg.atstring(self, group)} 宠物更换成功`;
    } else {
      return `${await cqmsg.atstring(self, group)} 未正确获取宠物名称！`
    }
  }
}

export const petname = new PetName();