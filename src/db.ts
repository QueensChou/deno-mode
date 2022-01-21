/// <reference types="./qq.d.ts" />
import { DataTypes, Database, Model, MySQLConnector } from 'https://deno.land/x/denodb/mod.ts';

const connector = new MySQLConnector({
  database: 'ffxiv',
  host: '127.0.0.1',
  username: 'ffxiv',
  password: 'password',
});

const db = new Database(connector);

// 创建用户表单
class User extends Model {
  static table = 'user';

  static fields = {
    user_id: DataTypes.BIG_INTEGER,
    group_id: DataTypes.BIG_INTEGER,
    nickname: DataTypes.STRING,
    card: DataTypes.STRING,
  };
}

// 创建用户表单
class MZData extends Model {
  static table = 'mzdata';

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    user_id: DataTypes.BIG_INTEGER,
    group_id: DataTypes.BIG_INTEGER,
    total: DataTypes.INTEGER,
    cmz_time: DataTypes.BIG_INTEGER,
    hp: DataTypes.INTEGER,
    qmz_time: DataTypes.BIG_INTEGER,
    floor: DataTypes.INTEGER,
    build_time: DataTypes.BIG_INTEGER,
    petname: DataTypes.STRING,
  };

  static defaults = {
    total: 0,
    cmz_time: 0,
    hp: 0,
    qmz_time: 0,
    floor: 0,
    build_time: 0,
    petname: '刻耳柏洛斯',
  };
}

db.link([User, MZData]);

await db.sync();

// 注册用户信息
export async function insertUserDB(data: groupList) {
  const result = await User.where({ user_id: data.user_id, group_id: data.group_id }).get();
  // console.log(result);
  if (result.length) {
    await User.where({ user_id: data.user_id, group_id: data.group_id }).update({ nickname: data.nickname, card: data.card });
  } else {
    await User.create({ ...data });
  }
}

// 查询用户id
export async function searchUserID(group_id:number, card:string) {
  let result = await User.where({ group_id: group_id, nickname: card }).get();
  // console.log(result);
  if (result instanceof Array && result.length) {
    return result[0].user_id;
  } else {
    result = await User.where({ group_id: group_id, card: card }).get();
    if (result instanceof Array && result.length) {
      return result[0].user_id;
    } else {
      return 0;
    }
  }
}

// 查询用户昵称
export async function searchUserCard(user_id:number, group_id:number) {
  const result = await User.where({ user_id: user_id, group_id: group_id }).get();
  // console.log(result);
  if (result instanceof Array && result.length) {
    return result[0].card ? result[0].card : result[0].nickname;
  } else {
    return '';
  }
}

// 查询闷砖信息
export async function searchMZDB(user_id:number, group_id:number) {
  const result = await MZData.where({ group_id: group_id, user_id: user_id }).get();
  // console.log(result);
  if (result instanceof Array && result.length) {
    return result[0] as unknown as MZList;
  } else {
    return null;
  }
}

// 输入闷砖信息
export async function insertMZDB(data:MZList) {
  const result = await MZData.where({ user_id: data.user_id, group_id: data.group_id }).get();
  // console.log(result);
  if (result.length) {
    await MZData.where({ user_id: data.user_id, group_id: data.group_id }).update({ ...data });
  } else {
    await MZData.create({ ...data });
  }
}
