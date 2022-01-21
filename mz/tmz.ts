/// <reference types="../src/qq.d.ts" />
import { searchMZDB, insertMZDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';

export class Tmz {
  private name = 'tmz';
  private regName = /^tmz\s+(?<param>.*)$/;
  private regParam = /^(?<enemy>\d+)\s+(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `参数错误!  示例：\n/tmz 偷上一个发言人\n/tmz @xx 偷指定某人`;
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
    const self = Number(arrCmd?.groups?.self);
    const enemy = Number(arrCmd?.groups?.enemy);
    const group = Number(arrCmd?.groups?.group);
    // console.log(quantity, self, enemy, group);
    // 获取双方数据
    let selfData = await searchMZDB(self, group);
    const enemyData = await searchMZDB(enemy, group);
    const selfDefault: MZList = {
      user_id: enemy,
      group_id: group,
      total: 0,
      hp: 0,
      qmz_time: 0,
    };
    if(!selfData) {
      // 自身数据不存在则创建
      selfData = selfDefault;
    }
    // 第二天回血
    if (dayjs().isAfter(dayjs(selfData.qmz_time),'day')) {
      selfData.hp = this.TOP_HP;
    }
    // 自身hp不足
    if (!selfData.hp) {
      return `${await cqmsg.atstring(self, group)} 你已经阵亡了，等待明日复活吧！`;
    }
    // 偷自己
    if (selfData.user_id === enemyData?.user_id) {
      return `${await cqmsg.atstring(self, group)} 自己的闷砖还用偷吗？`;
    }
    // 对方数据不存在或者数量少于10
    if (!enemyData || Number(enemyData.total) <= 10) {
      return `${await cqmsg.atstring(self, group)} 对方闷砖太少了，给别人留点吧！`;
    } else {
      return await this.tmzRandom(selfData, enemyData);
    }
  }

  private async tmzRandom(selfData:MZList, enemyData:MZList) {
    let msg = '';
    let tmz = 0;
    const number = Math.floor(Math.random() * 10);
    switch (number) {
      case 0:
      case 1:
        selfData.hp = 0;
        selfData.qmz_time = Date.now();
        await insertMZDB(selfData);
        msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 想偷取 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 的闷砖，结果被对方的${enemyData.petname}发现，一口就没了~`;
        break;
      case 2:
      case 3:
        tmz = Math.floor(Math.random() * 4 + 7);
        selfData.total = selfData.total as number + tmz;
        enemyData.total = enemyData.total as number - tmz;
        await insertMZDB(selfData);
        await insertMZDB(enemyData);
        msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 身手矫健，成功偷取了 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 的${tmz}块闷砖！`;
        break;
      case 4:
      case 5:
        tmz = Math.floor(Math.random() * 4 + 3);
        selfData.total = selfData.total as number + tmz;
        enemyData.total = enemyData.total as number - tmz;
        await insertMZDB(selfData);
        await insertMZDB(enemyData);
        msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 身手平平，偷取了 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 的${tmz}块闷砖！`;
        break;
      case 6:
      case 7:
        tmz = Math.floor(Math.random() * 2 + 1);
        selfData.total = selfData.total as number + tmz;
        enemyData.total = enemyData.total as number - tmz;
        await insertMZDB(selfData);
        await insertMZDB(enemyData);
        msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 急于求成，只偷取了 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 的${tmz}块闷砖！`;
        break;
      case 8:
      case 9:
        tmz = Math.floor(Math.random() * 2 + 1);
        selfData.total = selfData.total as number - tmz;
        enemyData.total = enemyData.total as number + tmz;
        await insertMZDB(selfData);
        await insertMZDB(enemyData);
        msg = `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 被 ${await cqmsg.atstring(enemyData.user_id, enemyData.group_id)} 的${enemyData.petname}发现，为了保命，只好丢下${tmz}块闷砖逃走了！`;
        break;
      default:
        break;
    }
    return msg;
  }
}