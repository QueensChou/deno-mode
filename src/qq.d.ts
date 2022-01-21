interface qqMessage {
  time: number,
  self_id: number,
  post_type: string,
  message_type: string,
  sub_type: string,
  temp_source: number,
  message_id: number,
  group_id: number,
  user_id: number,
  anonymous: Anonymous,
  message: CQMessage[],
  raw_message: string,
  font: number,
  sender: Sender,
  data: Sender[],
}

interface Sender {
  group_id: number,
  user_id: number,
  nickname: string,
  card: string,
  sex: string,
  age: number,
  area: string,
  level: string,
  role: string,
  title: string,
}

interface Anonymous {
  id: number,
  name: string,
  flag: string,
}

interface CQMessage {
  type: string,
  data: {
    text?: string,
    id?: string,
    file?: string,
    qq?: string,
    type?: string,
    url?: string,
    title?: string,
    lat?: string,
    lon?: string,
    audio?: string,
    nickname?: string,
    content?: string | CQMessage[],
    data?: string,
  }
}

interface MZList {
  user_id: number,
  group_id: number,
  total?: number,
  cmz_time?: number,
  hp?: number,
  qmz_time?: number,
  floor?: number,
  build_time?: number,
  petname?: string,
}

interface groupList {
  user_id: number,
  group_id: number,
  nickname: string,
  card: string,
}