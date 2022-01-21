/// <reference types="../src/qq.d.ts" />
import { searchMZDB, insertMZDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';

export class Qmz {
  private name = 'qmz';
  private regName = /^qmz\s+(?<param>.*)$/;
  // public defaultParam = '1';
  private regParam = /^((?<quantity>\d+|max)\s+)?(?<enemy>\d+)\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `参数错误!  示例：\n/qmz n 用n块砖敲上一个发言人\n/qmz @xx n 用n块砖敲指定某人\n以上示例n皆可省略，或直接使用max拼个你死我活！`;
  private TOP_HP = 10;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    // console.log(param);
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      console.log(this.paramError);
      return this.paramError;
    }
  }

  public async runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const quantity = arrCmd?.groups?.quantity ? arrCmd?.groups?.quantity : '1';
    const self = Number(arrCmd?.groups?.self);
    const enemy = Number(arrCmd?.groups?.enemy);
    const group = Number(arrCmd?.groups?.group);
    // console.log(quantity, self, enemy, group);
    // 获取双方数据
    const selfData = await searchMZDB(self, group);
    const enemyData = await searchMZDB(enemy, group);
    let enemyDefault: MZList = {
      user_id: enemy,
      group_id: group,
      total: 0,
      hp: 0,
      qmz_time: 0,
    };
    let defaultMZ = 0;
    if(!selfData) {
      // 自身无数据
      return `${await cqmsg.atstring(self, group)} 你从未抽过闷砖，输入/cmz抽取！`;
    } else if ( !selfData.total || selfData.total <= 0) {
      // 闷砖不足
      return `${await cqmsg.atstring(self, group)} 你已经没有闷砖了！`;
    } else {
      // 第二天回血
      if (dayjs().isAfter(dayjs(selfData.qmz_time),'day')) {
        selfData.hp = this.TOP_HP;
      }
      // 自身hp不足
      if (!selfData.hp) {
        return `${await cqmsg.atstring(self, group)} 你已经阵亡了，等待明日复活吧！`;
      }
      // 对方数据存在则使用，否则使用默认数据
      if (enemyData) {
        enemyDefault = enemyData;
      }
      // 对手第二天回血
      if (dayjs().isAfter(dayjs(enemyDefault.qmz_time),'day')) {
        enemyDefault.hp = this.TOP_HP;
      }
      // 对手hp不足
      if (!enemyDefault.hp) {
        return `${await cqmsg.atstring(self, group)} 对手已阵亡，难道你还要鞭尸吗？`;
      }
      // 设定闷砖数量
      if (quantity === 'max' || Number(quantity) >= 10) {
        defaultMZ = 10;
      } else {
        defaultMZ = Number(quantity)
      }
      // 不能超过自身闷砖数
      if (defaultMZ > selfData.total) {
        defaultMZ = selfData.total;
      }
      // 不能超过对手hp值
      if (defaultMZ > enemyDefault.hp) {
        defaultMZ = enemyDefault.hp;
      }
      // 执行敲闷砖
      return await this.qmzRandom(selfData, enemyDefault, defaultMZ);
    }
  }

  private async qmzRandom(selfData:MZList, enemyData:MZList, quantity:number) {
    if (selfData.user_id === enemyData.user_id) {
      selfData.total = selfData.total as number - quantity;
      selfData.hp = selfData.hp as number - quantity;
      selfData.qmz_time = Date.now();
      await insertMZDB(selfData);
      return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 拿起${quantity}块闷砖对着自己的脑袋狠狠的来了一下！${this.hpResult(selfData.hp,'self')}`;
    } else {
      let msg = '';
      const number = Math.floor(Math.random() * 10);
      switch (number) {
        case 0:
        case 1:
          selfData.total = selfData.total as number - quantity;
          enemyData.hp = enemyData.hp as number - quantity;
          enemyData.qmz_time = Date.now();
          await insertMZDB(selfData);
          await insertMZDB(enemyData);
          msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 拿起${quantity}块闷砖对 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 狠狠来了一记闷砖！${this.hpResult(enemyData.hp, 'enemy')}`;
          break;
        case 2:
        case 3:
          selfData.total = selfData.total as number - quantity;
          enemyData.hp = enemyData.hp as number - quantity * 2;
          enemyData.qmz_time = Date.now();
          await insertMZDB(selfData);
          await insertMZDB(enemyData);
          msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 拿起${quantity}块闷砖敲中了 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 命门，造成了双倍伤害！${this.hpResult(enemyData.hp, 'enemy')}`;
          break;
        case 4:
        case 5:
          selfData.total = selfData.total as number - quantity;
          await insertMZDB(selfData);
          msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 手滑甩飞了${quantity}块闷砖！`;
          break;
        case 6:
        case 7:
          selfData.total = selfData.total as number - quantity;
          selfData.hp = selfData.hp as number - quantity;
          await insertMZDB(selfData);
          msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 不小心被发现了！被 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 夺走了${quantity}块闷砖并狠狠来了一记！${this.hpResult(selfData.hp, 'self')}`;
          break;
        case 8:
        case 9:
          selfData.total = selfData.total as number - quantity;
          enemyData.total = enemyData.total as number + quantity;
          await insertMZDB(selfData);
          await insertMZDB(enemyData);
          msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 没抓稳，${quantity}块闷砖掉在地上被 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 捡走了！`;
          break;
        default:
          break;
      }
      return msg;
    }
  }

  private hpResult(hp:number, type = 'enemy'){
    switch (type) {
      case 'self':
        return hp <= 0 ? `R.I.P~你自己被敲死了！` : `你自己还剩${hp}点HP！`;
      case 'enemy':
        return hp <= 0 ? `WOW~对方被你敲死了！` : `对方还剩${hp}点HP！`;
      default:
        break;
    }
  }
}