import { Dice } from './dice.ts'

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
    }
    
    return all.join('');
  }

  private roll3d6 (){
    const dice = new Dice();
    dice.quantity = 3;
    dice.surface = 6;
    dice.roll();
    return dice.totalValue() * 5;
  }

  private roll2d6 (){
    const dice = new Dice();
    dice.quantity = 2;
    dice.surface = 6;
    dice.roll();
    return (dice.totalValue() + 6) * 5;
  }
}