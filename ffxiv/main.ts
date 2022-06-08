import { randomNum, roll } from '../dice/dice.ts';
import { searchDB, insertDB, totalDB, deleteDB, insertRank, orderDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';
const response = await fetch(new URL("./data.json", import.meta.url));
const ffxivData:FFDATA = await response.json();

interface FFDATA {
  total: number,
  city: {
    name: string,
    id: number,
    owner: string,
  } [],
  npc: {
    name: string,
    buff: string,
    probably: number,
  } [],
  enemy: {
    name: string,
    att: number,
    buff: string,
  } [],
  pet: {
    name: string,
    buff: number,
    probably: number,
  } []
}

class FFXIV {
  private name = 'ffxiv';
  private regName = /^ffxiv\s+(?<param>.*)$/;
  private regParam = /^(?<order>(go|status|city|rank|topATT)?)((att\s+(?<cityname>\S+))?)\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = '参数错误! go为执行一次行动，status为查看自身状态，city为查看目前城市所有者，rank为查看往期胜者，topATT为查看攻击力前五，att 城市名称 为自选攻击!';
  private TOP_GP = 5;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      console.log(param);
      return this.paramError;
    }
  }

  public async runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    // console.log(arrCmd);
    const self = Number(arrCmd?.groups?.self);
    const group = Number(arrCmd?.groups?.group);
    const order = arrCmd?.groups?.order;
    console.log(order, self, group);
    if (order) {
      if (order === 'go') {
        return await this.go(self, group);
      } else if (order === 'city') {
        return await this.city(group);
      } else if (order === 'rank') {
        return await this.rank(group);
      } else if (order === 'topATT') {
        return await this.topATT(group);
      } else {
        return  await this.status(self, group);
      }
    } else {
      const cityname = arrCmd?.groups?.cityname;
      console.log(cityname);
      for (let index = 0; index < ffxivData.city.length; index++) {
        const element = ffxivData.city[index];
        if (cityname === element.name) {
          return await this.attCity(self, group, cityname);
        }
      }
      return '不存在指定的城市！';
    }
  }

  // go指令
  private async go(self:number, group:number) {
    // console.log(`来自${group}的${self}行动`);
    const selfData = await searchDB({ user_id: self,group_id: group },'players','all') as unknown as players;
    let defaultData = {
      user_id: self,
      group_id: group,
      gp: 3,
      att: 20,
      select_gp: 3,
      last_time: dayjs().startOf('hour').valueOf(),
      select_time: dayjs().startOf('hour').valueOf(),
    }
    if (selfData) {
      defaultData = selfData;
    }
    // console.log('数据库：', defaultData);
    let str = ''; //记录日志
    const nowTime = dayjs();
    // 回复gp
    if (nowTime.isAfter(dayjs(defaultData.last_time), 'hour')) {
      defaultData.gp = (nowTime.diff(defaultData.last_time, 'hour') + defaultData.gp) < this.TOP_GP ? nowTime.diff(defaultData.last_time, 'hour') + defaultData.gp : this.TOP_GP;
    }
    // console.log('更新后：', defaultData);
    const gp = defaultData.gp;
    if (gp < 1) {
      return `${await cqmsg.atstring(self, group)} 的行动力不足，无法行动，请等下个整点恢复!`;
    }
    // 随机事件，1抵达城市发起挑战，2遇到npc获取buff，3遇到boss战斗，4遇到宠物影响行动力
    const number = randomNum(100);
    defaultData.last_time = dayjs().startOf('hour').valueOf();
    if (number <= 88) {
      str = await this.cityEnvent(defaultData, 'random');
    } else if (number <= 92) {
      str = await this.npcEnvent(defaultData);
    } else {
      str = await this.petEnvent(defaultData);
    }
    // str = await this.cityEnvent(defaultData);
    return str;
  }

  // att指令
  private async attCity(self:number, group:number, cityname:string) {
    // console.log(`来自${group}的${self}行动`);
    const selfData = await searchDB({ user_id: self,group_id: group },'players','all') as unknown as players;
    let defaultData = {
      user_id: self,
      group_id: group,
      gp: 3,
      att: 20,
      select_gp: 3,
      last_time: dayjs().startOf('hour').valueOf(),
      select_time: dayjs().startOf('hour').valueOf(),
    }
    if (selfData) {
      defaultData = selfData;
    }
    // console.log('数据库：', defaultData);
    let str = ''; //记录日志
    const nowTime = dayjs();
    // 回复gp
    if (nowTime.isAfter(dayjs(defaultData.select_time), 'day')) {
      defaultData.select_gp = 3;
    }
    // console.log('更新后：', defaultData);
    const gp = defaultData.select_gp;
    if (gp < 1) {
      return `${await cqmsg.atstring(self, group)} 的攻击次数不足，无法攻击，请等明日恢复!`;
    }
    // 随机事件，1抵达城市发起挑战，2遇到npc获取buff，3遇到boss战斗，4遇到宠物影响行动力
    defaultData.select_time = dayjs().startOf('hour').valueOf();
    str = await this.cityEnvent(defaultData, 'select', cityname);
    // str = await this.cityEnvent(defaultData);
    return str;
  }

  // 城市事件
  private async cityEnvent(selfData:players, type:'random'|'select', cityname?: string) {
    const citys = ffxivData.city, self = selfData.user_id, group = selfData.group_id;
    const number = randomNum(citys.length) - 1;
    let city = citys[number];
    if (type === 'select') {
      for (let index = 0; index < citys.length; index++) {
        const element = citys[index];
        if (cityname === element.name) {
          city = element;
          break;
        }
      }
    }
    // console.log('所有城市：', citys,'roll点：', number, '选择城市：', city);
    const owner = await searchDB({city_id: city.id, group_id: group}, 'city_owner', 'user_id');
    // console.log('返回的城主为：', owner);
    let str = '';
    if (owner && owner === self) {
      if (type === 'select') {
        return `${await cqmsg.atstring(self, group)} 你无法攻打自己的城市！`;
      }
      const buffAtt = roll('1d6');
      selfData.att = selfData.att + buffAtt;
      // 行动力减少
      selfData.gp--;
      await insertDB({user_id: self, group_id: group}, 'players', selfData);
      str = `${await cqmsg.atstring(self, group)} 来到自己的主城 ${city.name} ，经过充足的休息，你的攻击力增加了 1d6: ${buffAtt} 点!`;
      if (selfData.att >= 100) {
        // 全部占领，游戏结束，清楚数据！
        str = str + '\n你已经无人能敌了，恭喜你成为本期的胜者!';
        await insertRank({user_id:self, group_id:group});
        await deleteDB({group_id:group}, 'city_owner');
        await deleteDB({group_id:group}, 'players');
        return str;
      }
    } else {
      const enemyAtt = owner ? await searchDB({user_id: Number(owner), group_id: group}, 'players', 'att') : 20;
      const owner_name = owner ? await searchDB({user_id: Number(owner), group_id: group}, 'user', 'card', undefined, 'nickname') : city.owner; 
      const maxBuff = 4;
      const selfRoll = randomNum(selfData.att);
      const enemyRoll = randomNum(enemyAtt as number);
      const enemyBuff = Math.round(enemyRoll * 0.25) > maxBuff ? maxBuff : Math.round(enemyRoll * 0.25);
      type === 'select' ? selfData.select_gp-- : selfData.gp--;
      str = `${await cqmsg.atstring(self, group)} 来到了 ${city.name}，并向城主 ${owner_name} 发起了挑战!\n你 roll 1d${selfData.att}，结果为${selfRoll}\n对方 roll 1d${enemyAtt}，结果为${enemyRoll + enemyBuff}（${enemyRoll} + ${enemyBuff}）`;
      if (selfRoll > (enemyRoll + enemyBuff)) {
        // 挑战成功，占领城市
        const get_time = Date.now();
        str = str + `\n你获得了胜利，你现在是 ${city.name} 的城主了!`;
        await insertDB({city_id: city.id, group_id: group}, 'city_owner', {user_id: self, get_time: get_time});
        // 查询获得城市数量
        const total = await totalDB({user_id: self, group_id: group}, 'city_owner');
        // console.log(total);
        if (total >= citys.length) {
          // 全部占领，游戏结束，清楚数据！
          str = str + '\n你占领了全部的城市，恭喜你成为本期的胜者!';
          await insertRank({user_id:self, group_id:group});
          await deleteDB({group_id:group}, 'city_owner');
          await deleteDB({group_id:group}, 'players');
          return str;
        }
      } else {
        // 挑战失败
        str = str + `\n你失败了，只能默默离开!`;
      }
      await insertDB({user_id: self, group_id: group}, 'players', selfData);
    }
    return str;
  }

  private async petEnvent(selfData:players) {
    const pets = ffxivData.pet, self = selfData.user_id, group = selfData.group_id;
    const number = randomNum(100);
    let str = '';
    for (const elem of pets.values()) {
      if (number <= elem.probably) {
        // console.log('初始值：',selfData.gp,' 加成值：',elem.buff);
        selfData.gp = selfData.gp + elem.buff;
        str = `${await cqmsg.atstring(self, group)} 遇到了 ${elem.name}，行动力增加了 ${elem.buff} 点!`;
        break;
      }
    }
    // console.log('最终值：',selfData.gp);
    await insertDB({user_id: self, group_id: group}, 'players', selfData);
    return str;
  }

  private async npcEnvent(selfData:players) {
    const pets = ffxivData.npc, self = selfData.user_id, group = selfData.group_id;
    const number = randomNum(100);
    let str = '';
    selfData.gp--;
    for (const elem of pets.values()) {
      if (number <= elem.probably) {
        if (elem.buff === '0') {
          str = `${await cqmsg.atstring(self, group)} 遇到了 ${elem.name}，她给你做了一套新衣服，并没有任何效果！`
        } else {
          const buffAtt = roll(elem.buff);
          selfData.att = selfData.att + buffAtt;
          str = `${await cqmsg.atstring(self, group)} 遇到了 ${elem.name}，经过指导，你的攻击力增加了 ${elem.buff}：${buffAtt} 点!`;
        }
        break;
      }
    }
    if (selfData.att >= 100) {
      // 全部占领，游戏结束，清楚数据！
      str = str + '\n你已经无人能敌了，恭喜你成为本期的胜者!';
      await insertRank({user_id:self, group_id:group});
      await deleteDB({group_id:group}, 'city_owner');
      await deleteDB({group_id:group}, 'players');
      return str;
    }
    // console.log('最终值：',selfData.gp);
    await insertDB({user_id: self, group_id: group}, 'players', selfData);
    return str;
  }

  // city指令
  private async city(group:number) {
    const data = await searchDB({group_id: group}, 'city_owner', 'list') as unknown as cityList [];
    // console.log(data);
    let str = '';
    for (let index = 0; index < ffxivData.city.length; index++) {
      const e = ffxivData.city[index];
      if (data && data instanceof Array) {
        for (let index = 0; index < data.length; index++) {
          const item = data[index];
          // console.log(item.city_id, e.id);
          if (item.city_id === e.id) {
            str = str + `${e.name} 属于 ${await cqmsg.atstring(item.user_id, group)}\n`
            // console.log( str );
          }
        }
      }
    }
    if (str === '') {
      str = '没有任何人占领城市';
    }
    return str;
  }

  // status指令
  private async status(self:number, group:number) {
    const data = await searchDB({user_id:self, group_id: group}, 'players', 'all') as unknown as players;
    // console.log(data);
    let str = `${await cqmsg.atstring(self, group)} 没有查到你的数据!`;
    if (data) {
      // 回复gp
      const nowTime = dayjs();
      if (nowTime.isAfter(dayjs(data.last_time), 'hour')) {
        data.gp = (nowTime.diff(data.last_time, 'hour') + data.gp) < this.TOP_GP ? nowTime.diff(data.last_time, 'hour') + data.gp : this.TOP_GP;
      }
      if (nowTime.isAfter(dayjs(data.select_time), 'day')) {
        data.select_gp = 3;
      }
      str = `${await cqmsg.atstring(self, group)} 数据如下：\n行动力：${data.gp}\n攻击力：${data.att}\n自选攻击次数：${data.select_gp}`;
    }
    return str;
  }

  // rank指令
  private async rank(group:number) {
    const data = await searchDB({group_id: group}, 'ranks', 'list') as unknown as ranks[];
    // console.log(data);
    let str = `没有查到以往数据!`;
    if (data) {
      str = '往期胜者：';
      for (const [index, elem] of data.entries()) {
        str = str + `\n第${index + 1}期：${await cqmsg.atstring(elem.user_id, elem.group_id)}`;
      }
    }
    return str;
  }

  // topATT指令
  private async topATT(group:number) {
    const data = await orderDB({group_id:group}, 'players', 'att') as unknown as players[];
    let str = '没有查到任何数据！'
    // console.log(data);
    if (data.length > 0) {
      str = '攻击力前五如下：'
      for (const [index, elem] of data.entries()) {
        if (index > 4) break;
        str = str + `\n${await cqmsg.atstring(elem.user_id, elem.group_id)} ${elem.att} 攻击力`;
      }
    }
    return str;
  }
}

export const ffxiv = new FFXIV();