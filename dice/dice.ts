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