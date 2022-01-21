/// <reference types="../src/qq.d.ts" />
import { searchMZDB, insertMZDB } from '../src/db.ts';
import { dayjs } from '../plugin/dayjs.ts';
import { cqmsg } from '../src/cqmsg.ts';

export class Build {
  private name = 'build';
  private regName = /^build\s*(?<param>.*)$/;
  private regParam = /^(?<self>\d+)\s+(?<group>\d+)\s*$/;
  private paramError = `该指令无需任何参数！`;
  private TOP_HP = 10;

  public isCmd (text:string) {
    return this.regName.test(text);
  }

  public isParam (text:string) {
    const param = this.regName.exec(text)?.groups?.param;
    if (param !== undefined && this.regParam.test(param)) {
      return this.runCmd(param);
    } else {
      // console.log(param);
      return this.paramError;
    }
  }

  public async runCmd (text:string) {
    const arrCmd = this.regParam.exec(text);
    const self = Number(arrCmd?.groups?.self);
    const group = Number(arrCmd?.groups?.group);
    const selfData = await searchMZDB(self, group);
    if(!selfData) {
      // 自身无数据
      return `${await cqmsg.atstring(self, group)} 你从未抽过闷砖，输入/cmz抽取！`;
    } else {
      // 第二天回血
      if (dayjs().isAfter(dayjs(selfData.qmz_time),'day')) {
        selfData.hp = this.TOP_HP;
      }
      // 自身hp不足
      if (!selfData.hp) {
        return `${await cqmsg.atstring(self, group)} 你已经阵亡了，等待明日复活吧！`;
      }
      // 数量不足
      if (!selfData.total || selfData.total < 10) {
        return `${await cqmsg.atstring(self, group)} 你只有${selfData.total}块闷砖，至少需要10块才能建造！`;
      } else {
        if (dayjs().isSame(dayjs.unix(selfData.build_time),'day')) {
          return `${await cqmsg.atstring(self, group)} 你今天已经建造过了，你的房子有${selfData.floor}层了！`;
        } else {
          return await this.randomBuild(selfData)
        }
      }
    }
  }

  private async randomBuild(selfData: MZList) {
    const number = Math.floor(Math.random() * 10);
    if (number < 1) {
      return await this.buildSuc(selfData, 1);
    } else if (number < 2) {
      return await this.buildfail(selfData, 1);
    } else if (number < 4) {
      return await this.buildfail(selfData);
    } else if (number < 6) {
      return await this.buildSuc(selfData, 2);
    } else {
      return await this.buildSuc(selfData);
    }
  }

  private async buildSuc(selfData: MZList, type = 0) {
    if (type === 1) {
      selfData.floor = selfData.floor ? selfData.floor * 2 : 2;
      await this.buildresult(selfData);
      return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 引起了艾默里克的注意，他喊来一群天穹圣人把房子翻了个倍，你的房子为${selfData.floor}层！`;
    } else if (type === 2) {
      selfData.floor = selfData.floor ? selfData.floor + 2 : 2;
      await this.buildresult(selfData);
      return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 不愧是天穹圣人，一下子建造了2层房子，你的房子为${selfData.floor}层！`;
    } else {
      selfData.floor = selfData.floor ? selfData.floor + 1 : 1;
      await this.buildresult(selfData);
      return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 成功建造了1层房子，你的房子为${selfData.floor}层！`;
    }
  }

  private async buildfail(selfData: MZList, type = 0) {
    if (selfData.floor) {
      if (selfData.floor < 2) {
        selfData.floor = 0;
        await this.buildresult(selfData);
        return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 脚底一滑，砸坏了自己的房子，请明天重新开始建造吧！`;
      } else {
        if (type === 0) {
          selfData.floor--;
          await this.buildresult(selfData);
          return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 脚底一滑，砸坏了1层房子，你的房子为${selfData.floor}层！`;
        } else {
          selfData.floor = Math.ceil(selfData.floor / 2);
          await this.buildresult(selfData);
          return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 引来了尼德霍格，房子被其毁掉了一半，你的房子为${selfData.floor}层！`;
        }
      }
    } else {
      selfData.floor = 0;
      await this.buildresult(selfData);
      return `${await cqmsg.atstring(selfData.user_id, selfData.group_id)} 脚底一滑，白白浪费了10块砖，请明天重新开始建造吧！`;
    }
  }

  private async buildresult(selfData: MZList) {
    const time = Date.now();
    selfData.total = selfData.total as number - 10;
    selfData.build_time = time;
    await insertMZDB(selfData);
  }
}