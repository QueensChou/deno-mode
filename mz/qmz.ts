export class Qmz {
  private name = 'qmz';
  private regName = /^\/qmz\s*(?<param>.*)$/;
  // public defaultParam = '1';
  private regParam = /^((?<quantity>\d+|max)\s+)?(?<self>\d+)\s+(?<enemy>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `参数错误!  示例：\n/qmz n 用n块砖敲上一个发言人\n/qmz @xx n 用n块砖敲指定某人\n以上示例n皆可省略，或直接使用max拼个你死我活！`;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    console.log(param);
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      console.log(this.paramError);
      return this.paramError;
    }
  }

  public runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const quantity = arrCmd?.groups?.quantity;
    const self = arrCmd?.groups?.self;
    const enemy = arrCmd?.groups?.enemy;
    const group = arrCmd?.groups?.group;
    console.log(quantity, self, enemy, group);
    return `来自${group}的${self}用${quantity}块砖敲${enemy}`
  }
}