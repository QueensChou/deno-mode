export class Cmz {
  private name = 'cmz';
  private regName = /^\/cmz\s*(?<param>.*)$/;
  private regParam = /^(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `该指令无需任何参数！`;

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
    const self = arrCmd?.groups?.self;
    const group = arrCmd?.groups?.group;
    console.log(self, group);
    return `来自${group}的${self}抽闷砖`
  }
}