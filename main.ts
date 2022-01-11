import { Roll } from './dice/roll.ts';
import { Dnd } from './dice/dnd.ts';
import { Coc } from './dice/coc.ts';
import { Qmz } from './mz/qmz.ts';
import { Cmz } from './mz/cmz.ts';

const roll = new Roll();
const dnd = new Dnd();
const coc = new Coc();
const qmz = new Qmz();
const cmz = new Cmz();

const cmd = [roll, dnd, coc, qmz, cmz];

// 接收roll点指令
export function sentMsg(key:string){
  for (const item of cmd) {
    if (item.isCmd(key)) {
      if ('isParam' in item) {
        return item.isParam(key);
      } else {
        return item.runCmd()
      }
    }
  }
  return '无效指令';
}