import { Dice, totalValue } from './dice.ts'

export class Coc {
  public name = 'coc';
  public regName = /^\/coc\s*$/;
  private list = new Map([['力量','3d6'], ['体质','3d6'], ['体型','2d6'], ['敏捷','3d6'], ['外貌','3d6'], ['智力','2d6'], ['意志','3d6'], ['教育','2d6'], ['幸运','3d6']]);

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public runCmd () {
    const all:string[] = [];
    let total = 0, noLuck = 0;
    console.log(total);
    for (const [key, value] of this.list) {
      let number = 0;
      switch (value) {
        case '3d6':
          number = this.roll3d6();
          break;
        case '2d6':
          number = this.roll2d6();
          break;
        default:
          break;
      }
      total = total + number;
      if (key !== '幸运') {
        noLuck = noLuck + number;
      }
      all.push(`${key}:${number} `)
    }
    let str = `总计：${total}  不含幸运：${noLuck}\n`;
    for (const key of all.keys()) {
      if ((key + 1) % 3 === 0) {
        str = str + all[key] + '\n';
      } else {
        str = str + all[key];
      }
    }
    return str;
  }

  private roll3d6 (){
    const dice = new Dice();
    dice.quantity = 3;
    dice.surface = 6;
    return totalValue(dice.roll()) * 5;
  }

  private roll2d6 (){
    const dice = new Dice();
    dice.quantity = 2;
    dice.surface = 6;
    return (totalValue(dice.roll()) + 6) * 5;
  }
}