/// <reference types="./qq.d.ts" />
import { searchUserCard } from './db.ts';

class CQMsg {
  at(user_id:string) {
    return {
      type: "at",
      data: {
          qq: user_id
      }
    }
  }
  text(text:string) {
    return {
      type: "text",
      data: {
          text: text
      }
    }
  }
  replyMsg(type:string, text:string | CQMessage []) {
    return {
      type: type,
      data: text,
    }
  }
  async atstring(user_id:number, group_id:number){
    const card = await searchUserCard(user_id, group_id);
    if(card) {
      return '@' + card;
    }
  }
}

export const cqmsg = new CQMsg()