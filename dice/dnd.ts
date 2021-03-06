import { Dice, totalValue } from './dice.ts'

class Dnd {
  private name = 'dnd';
  private regName = /^dnd\s*$/;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public runCmd () {
    const dice = new Dice();
    dice.quantity = 4;
    dice.surface = 6;
    const all:string[] = [];
    for (let index = 0; index < 6; index++) {
      const element = dice.roll();
      const total = totalValue(element) - Math.min(...element);
      all.push(`(${element}): ${total}`);
      // console.log(all);
    }
    all.sort((a,b) => {
      const reg = /\:\s(?<number>\d+)$/;
      const prev = Number(reg.exec(a)?.groups?.number);
      const next = Number(reg.exec(b)?.groups?.number);
      return next - prev;
    })
    return all.join('\n');
  }
}

export const dnd = new Dnd();