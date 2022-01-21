export class Register {
  private name = 'register';
  private regName = /^register\s*$/;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public runCmd () {
    return '';
  }
}