/// <reference types="./qq.d.ts" />
import { reply } from './reply.ts';
import { prevQQ } from './ws.ts';
import { cqmsg } from './cqmsg.ts';
import { searchUserID } from './db.ts';
const groupCmd = /cmz|qmz|register|tmz|build|petname|rank|ffxiv/;
let enemyMsg = null;
const cmdStart = '-';

export async function qq(e:qqMessage) {
  if (e.raw_message.startsWith(cmdStart)) {
    let message = e.raw_message.replace(cmdStart, '');
    const groupArr = groupCmd.exec(message);
    if(groupArr) {
      if(e.group_id){
        if (/cmz|build|petname|rank|ffxiv/.test(groupArr[0])) {
          message = `${message} ${e.user_id} ${e.group_id}`;
        } else if (/qmz|tmz/.test(groupArr[0])) {
          enemyMsg = await getEnemy(message, e.group_id);
          // console.log('返回对手数据：', enemyMsg);
          if (enemyMsg) {
            message = `${enemyMsg} ${e.user_id} ${e.group_id}`;
          } else{
            return cqmsg.replyMsg('send', '未获取到上一位发言人或者@对象不存在或对方更新名片，请使用register指令更新群员数据！');
          }
        } else if (groupArr[0] === 'register') {
          return cqmsg.replyMsg('getInfo','');
        }
      } else {
        return cqmsg.replyMsg('send', '该指令需在群内使用！');
      }
    }
    const result = await reply(message);
    return cqmsg.replyMsg('send', result);
  }
}

async function getEnemy(msg:string, group_id:number) {
  const cqReg = /\[CQ:at,qq=(?<enemy>\d+)\]|@(?<card>\S+\s*)/;
  const enemy = cqReg.exec(msg)?.groups?.enemy;
  const card = cqReg.exec(msg)?.groups?.card;
  // console.log('获取对手：', enemy, card);
  msg = msg.replace(cqReg, ' ');
  if(enemy !== undefined) {
    // console.log('字符串替换:',msg);
    msg = msg + ` ${enemy}`;
  } else {
    if (card !== undefined) {
      const user_id = await searchUserID(group_id, card)
      if (user_id) {
        msg = msg + ` ${user_id}`;
      } else {
        return false;
      }
    } else {
      if (prevQQ.size === 0) {
        return false;
      } else {
        msg = msg + ` ${prevQQ.get(group_id)}`;
      }
    }
  }
  return msg;
}