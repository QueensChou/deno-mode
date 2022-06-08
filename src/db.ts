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

// 创建闷砖表单
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
    total: 20,
    cmz_time: 0,
    hp: 10,
    qmz_time: 0,
    floor: 10,
    build_time: 0,
    petname: '刻耳柏洛斯',
  };
}

// 创建城市表单
class CityOwner extends Model {
  static table = 'city_owner';

  static fields = {
    city_id: DataTypes.integer(5),
    group_id: DataTypes.BIG_INTEGER,
    user_id: DataTypes.BIG_INTEGER,
    get_time: DataTypes.BIG_INTEGER,
  };
}

// 创建城市表单
class Players extends Model {
  static table = 'players';

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    user_id: DataTypes.BIG_INTEGER,
    group_id: DataTypes.BIG_INTEGER,
    gp: DataTypes.INTEGER,
    att: DataTypes.INTEGER,
    select_gp: DataTypes.INTEGER,
    last_time: DataTypes.BIG_INTEGER,
    select_time: DataTypes.BIG_INTEGER,
  };

  static defaults = {
    gp: 3,
    att: 20,
    select_gp: 3,
  };
}

// 创建榜单表单
class Ranks extends Model {
  static table = 'ranks';

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    user_id: DataTypes.BIG_INTEGER,
    group_id: DataTypes.BIG_INTEGER,
  };
}

db.link([User, MZData, CityOwner, Players, Ranks]);

await db.sync();

const dbList = {
  user() {
    return User;
  },
  mzdata() {
    return MZData;
  },
  city_owner() {
    return CityOwner;
  },
  players() {
    return Players;
  },
  ranks() {
    return Ranks;
  },
}

// 查询数据库
export async function searchDB(searchdata:DBList, dbname: 'user'|'mzdata'|'city_owner'|'players'|'ranks', firstItem: string, replaceDta?: DBList, SecondItem?: string) {
  const DB = dbList[dbname]();
  // console.log(searchdata);
  const result = await DB.where({ ...searchdata }).get();
  // console.log('查询到的数据1：', result);
  if (result instanceof Array && result.length) {
    if (SecondItem) {
      return result[0][firstItem] ? result[0][firstItem] : result[0][SecondItem];
    } else {
      if (firstItem === 'all') {
        return result[0];
      } else if (firstItem === 'list') {
        return result;
      } else {
        return result[0][firstItem];
      }
    }
  } else {
    if (replaceDta) {
      const result2 = await DB.where({ ...replaceDta }).get();
      // console.log('查询到的数据2：', result2);
      if (result2 instanceof Array && result2.length) {
        if (SecondItem) {
          return result2[0][firstItem] ? result2[0][firstItem] : result2[0][SecondItem];
        } else {
          if (firstItem === 'all') {
            return result2[0];
          } else if (firstItem === 'list') {
            return result2;
          } else {
            return result2[0][firstItem];
          }
        }
      }
    }
    return null;
  }
}

// 更新数据库
export async function insertDB(searchdata:DBList, dbname: 'user'|'mzdata'|'city_owner'|'players'|'ranks', insertData:DBList) {
  const DB = dbList[dbname]();
  const result = await DB.where({ ...searchdata }).get();
  // console.log(result);
  if (result.length) {
    await DB.where({ ...searchdata }).update({ ...insertData });
  } else {
    await DB.create({ ...searchdata, ...insertData });
  }
}

// 查询总数
export async function totalDB(searchdata:DBList, dbname: 'user'|'mzdata'|'city_owner'|'players'|'ranks') {
  const DB = dbList[dbname]();
  return await DB.where({ ...searchdata }).count();
}

// 排序查询
export async function orderDB(searchdata:DBList, dbname: 'user'|'mzdata'|'city_owner'|'players'|'ranks', by:string) {
  const DB = dbList[dbname]();
  return await DB.where({ ...searchdata }).orderBy(by, 'desc').all();
}

// 删除数据
export async function deleteDB(searchdata:DBList, dbname: 'user'|'mzdata'|'city_owner'|'players'|'ranks') {
  const DB = dbList[dbname]();
  await DB.where({ ...searchdata }).delete();
}

// 注册用户信息
export async function insertUserDB({ user_id, group_id, nickname, card }: groupList) {
  const result = await User.where({ user_id, group_id }).get();
  // console.log(result);
  if (result.length) {
    await User.where({ user_id, group_id }).update({ nickname, card });
  } else {
    await User.create({ user_id, group_id, nickname, card });
  }
}

// 查询用户id
export async function searchUserID(group_id:number, card:string) {
  let result = await User.where({ group_id, nickname: card }).get();
  // console.log(result);
  if (result instanceof Array && result.length) {
    return result[0].user_id;
  } else {
    result = await User.where({ group_id, card }).get();
    if (result instanceof Array && result.length) {
      return result[0].user_id;
    } else {
      return 0;
    }
  }
}

// 查询用户昵称
export async function searchUserCard(user_id:number, group_id:number) {
  const result = await User.where({ user_id, group_id }).get();
  // console.log(result);
  if (result instanceof Array && result.length) {
    return result[0].card ? result[0].card : result[0].nickname;
  } else {
    return '';
  }
}

// 查询闷砖信息
export async function searchMZDB(user_id:number, group_id:number) {
  const result = await MZData.where({ group_id , user_id }).get();
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

// 输入榜单信息
export async function insertRank(data:DBList) {
  await Ranks.create({ ...data });
}