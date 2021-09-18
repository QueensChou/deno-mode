import { Dice } from './dice.ts'

class Roll {
  public name = 'roll';
  public regName = /^\/roll\s*(?<param>.*)$/;
  public hasParam = true;
  public defaultParam = '1d100';
  public regParam = /^(?<quantity>\d*)[dD](?<surface>\d+)\s*(?<adjust>(\s*[\+\-]\s*\d+)*)\s*$/;
  public paramError = '参数错误!参数为xDy+z，x为数量（可选，默认为1），y为面数，z为调整值（可选，可重复，默认为1）';

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    let param = this.regName.exec(text)?.groups?.param;
    if (param === '') {
      param = this.defaultParam;
    }
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      console.log(this.paramError);
      return this.paramError;
    }
  }

  public runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const surface = arrCmd?.groups?.surface;
    let type:string[] = [], value:string[] = [];
    let quantity = arrCmd?.groups?.quantity;
    let adjust = arrCmd?.groups?.adjust;
    let total = 0, str = '';
    if(quantity === '') {
      quantity = '1';
    }
    if (typeof adjust === 'string') {
      adjust = adjust.replace(/\s*/g, '');
      type = adjust.split(/\d+/);
      type.pop();
      value = adjust.split(/[\-\+]/);
      value.shift();
    }
    console.log(`投掷${quantity}D${surface}${adjust}${type.length > 0 ? ',拆分为' : ''}${type}${type.length > 0 ? '和' : ''}${value}`);
    const dice = new Dice;
    dice.quantity = Number(quantity);
    dice.surface = Number(surface);
    const result = dice.roll();
    console.log(result);
    if (result.length > 1) {
      total = result.reduce((total:number, number:number) => total + number);
      str = `${quantity}D${surface}${adjust}: ${result.join('+')}=${total}`;
    } else {
      total = result[0];
      str = `${quantity}D${surface}${adjust}: ${total}`;
    }
    console.log(total);
    if ( type.length > 0) {
      for (const [index, item] of type.entries()) {
        switch (item) {
          case '+':
            total = total + Number(value[index]);
            break;
          
          case '-':
            total = total - Number(value[index]);
            break;

          default:
            break;
        }
      }
      console.log(total);
      if (total < 1) total = 1;
      str = `${quantity}D${surface}${adjust}: (${result.join('+')})${adjust}=${total}`;
    }
    return str;
  }
}

// 接收roll点指令
export function rollSent(key:string){
  const roll = new Roll();
  if (roll.isCmd(key)) {
    return roll.isParam(key);
  } else {
    return '指令错误！'
  }
}