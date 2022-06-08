export class Dice {
  public surface = 2;
  public quantity = 1;
  private result:number[] = [];
  
  public roll(){
    this.result = [];
    for (let index = 0; index < this.quantity; index++) {
      this.result.push(Math.floor(Math.random() * this.surface + 1)) ;
    }
    return this.result;
  }
}

export function totalValue(arr:number[]) {
  return arr.reduce((total:number, number:number) => total + number)
}

export function randomNum(max:number, min = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function roll(params: string) {
  const regParam = /^(?<quantity>\d*)[dD](?<surface>\d+)\s*$/;
  const arrCmd = regParam.exec(params);
  const surface = arrCmd?.groups?.surface ? Number(arrCmd?.groups?.surface) : 100;
  const quantity = arrCmd?.groups?.quantity ? Number(arrCmd?.groups?.quantity) : 1;
  const dice = new Dice();
  dice.quantity = quantity;
  dice.surface = surface;
  return totalValue(dice.roll());
}