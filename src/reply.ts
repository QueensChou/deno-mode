import { Roll } from '../dice/roll.ts';
import { Dnd } from '../dice/dnd.ts';
import { Coc } from '../dice/coc.ts';
import { Qmz } from '../mz/qmz.ts';
import { Cmz } from '../mz/cmz.ts';
import { Tmz } from '../mz/tmz.ts';
import { Build } from '../mz/build.ts';
import { PetName } from '../mz/pet.ts';

const roll = new Roll();
const dnd = new Dnd();
const coc = new Coc();
const qmz = new Qmz();
const cmz = new Cmz();
const tmz = new Tmz();
const build = new Build();
const petname = new PetName();

const cmd = [roll, dnd, coc, qmz, cmz, tmz, build, petname];

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