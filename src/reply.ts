import { roll } from '../dice/roll.ts';
import { dnd } from '../dice/dnd.ts';
import { coc } from '../dice/coc.ts';
import { qmz } from '../mz/qmz.ts';
import { cmz } from '../mz/cmz.ts';
import { tmz } from '../mz/tmz.ts';
import { build } from '../mz/build.ts';
import { petname } from '../mz/pet.ts';
import { rank } from '../mz/rank.ts';
import { ffxiv } from '../ffxiv/main.ts';

const cmd = [roll, dnd, coc, qmz, cmz, tmz, build, petname, rank, ffxiv];

// 接收roll点指令
export function reply(key:string){
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