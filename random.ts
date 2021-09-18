export function randomIndex (maps: Map<string, number>, total:number) {
  const number = Math.floor(Math.random() * total);
  // console.log(number);
  let start = 0;
  let end = 0;
  for (const [key, value] of maps) {
    end = end + value;
    // console.log(start, end);
    if (number >= start && number < end) {
      return key;
    } else {
      start = end;
    }
  }
}

export function roll (key = 'D100'):string[] | number[] {
  // console.log(key);
  const regDice = /^(?<count>\d*)[D](?<dice>\d+)$/;
  if (!regDice.test(key)) {
    return ['参数错误!参数为xDy+z，x为数量（可选），y为面数，z为调整值（可选，可重复）'];
  }
  const diceArray = regDice.exec(key);
  // console.log(diceArray);
  const count = diceArray?.groups?.count ? Number(diceArray?.groups?.count) : 1;
  const dice = Number(diceArray?.groups?.dice);
  if (count === 0) {
    return [0];
  }
  if (count > 100 || dice > 1000) {
    return ['不能roll超过100个骰子或超过1000面的骰子!'];
  }
  const result:number[] = [];
  console.log(`数量为${count},面数为${dice}`);
  for (let index = 0; index < count; index++) {
    result.push(Math.floor(Math.random() * dice + 1)) ;
  }
  return result;
}