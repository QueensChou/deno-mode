/// <reference types="./qq.d.ts" />
import { serve } from "https://deno.land/std@0.120.0/http/server.ts";
import { qq } from './qq.ts';
import { insertUserDB } from '../src/db.ts';

const prevQQ = new Map();
const nowQQ = new Map();

serve(handler, { port: 8008 });

console.log("listen on 8008");

function handler(req: Request): Response {
  const _upgrade = req.headers.get("upgrade") || "";
  let socket: WebSocket, response;
  try {
    const res = Deno.upgradeWebSocket(req);
    socket = res.socket;
    response = res.response;
  } catch {
    return new Response("request isn't trying to upgrade to websocket.");
  }
  socket.onopen = () => console.log("socket opened");
  socket.onmessage = (e) => {
    // console.log(e);
    const data:qqMessage = JSON.parse(e.data);
    // 非心跳事件
    if (data.post_type !== 'meta_event') {
      // console.log(data);

      if (data.message_type === 'group') {
        // 存储群聊上一个发言人信息
        if(nowQQ.size !== 0) {
          prevQQ.set(data.group_id, nowQQ.get(data.group_id));
        }
        nowQQ.set(data.group_id, data.user_id);
      }

      if (data.post_type === 'message') {
        // 收到消息进行处理
        qq (data).then(msg => {
          // 返回数据
          if (msg) {
            // 类型为回复消息
            if (msg.type === 'send') {
              const sendData:sendMsg = {
                action: 'send_private_msg',
                params: {
                  user_id: data.user_id,
                  message: msg.data,
                },
              };
              if (data.message_type === 'group') {
                sendData.action = 'send_group_msg';
                sendData.params = {
                  group_id: data.group_id,
                  message: msg.data,
                };
              }
              // console.log(sendData);
              console.log(msg.data);
              socket.send(JSON.stringify(sendData));
            } else if (msg.type === 'getInfo') {
              // 类型为获取群信息
              const sendData = {
                action: 'get_group_member_list',
                params: {
                  group_id: data.group_id,
                },
              };
              socket.send(JSON.stringify(sendData));
            }
          }
        });
      }

      // 处理收到的响应数据
      if (data.data) {
        const listData = data.data;
        let sendmsg = '数据更新成功';
        if (listData instanceof Array) {
          try {
            listData.forEach(element => {
              insertUserDB({
                user_id: element.user_id,
                group_id: element.group_id,
                nickname: element.nickname,
                card: element.card,
              });
            })
          } catch (error) {
            sendmsg = error + '';
          }
          const sendData = {
            action: 'send_group_msg',
            params: {
              group_id: listData[0].group_id,
              message: sendmsg,
            },
          };
          socket.send(JSON.stringify(sendData));
        }
      }
    }
  };
  socket.onerror = (e) => console.log("socket errored:", e);
  socket.onclose = () => console.log("socket closed");
  return response;
}

interface sendMsg {
  action: string,
  params: {
    group_id?: number,
    user_id?: number,
    message: string | CQMessage []
  }
}

export { prevQQ };