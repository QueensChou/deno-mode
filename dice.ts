export class Dice {
  public surface = 2;
  public quantity = 1;
  
  public roll(){
    const result:number[] = [];
    for (let index = 0; index < this.quantity; index++) {
      result.push(Math.floor(Math.random() * this.surface + 1)) ;
    }
    return result;
  }
}