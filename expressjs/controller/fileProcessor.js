const request = require('request')
const moment = require('moment-timezone')
var Getter = require('./Getter')
var Storage = require('../initializeStorage');
require('dotenv').config();
const accessTok = process.env.ACCESS_TOKEN;
const line_reply = process.env.LINE_REPLY;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessTok}`
}

const processFile = (reply_token, msg) => {
  reply(reply_token, msg)
}

async function reply(reply_token, msg) {

  const msgType = msg.message.type;
  const timeStamp = msg.timestamp;
  const bkkTimeStamp = moment(timeStamp).tz('Asia/Bangkok').format('DD-MMMM-YYYY-h:mm:ss');
  const date = moment(timeStamp).tz('Asia/Bangkok').format('DD-MMMM-YYYY')
  const groupId = msg.source.groupId
  const senderId = msg.source.userId
  const groupName = await Getter.getGroupName(groupId);
  const senderName = await Getter.getSenderName(groupId, senderId);

  const fileBinary = await Getter.getFile(msg.message.id);
  const extension = await getFileExtension(msg.message, msgType);
  const imageURL = await saveToStorage(groupId, senderId, msg.message, extension, fileBinary.data)
  insertFileByGroupId(groupId, senderId, msgType, imageURL, bkkTimeStamp, date, extension)
  const msgContent = JSON.stringify(imageURL);

  // let body = JSON.stringify({
  //     replyToken: reply_token,
  //     messages: [
  //         {
  //         type: 'text',
  //         text: `GroupId: ${groupId}\nUserId: ${senderId}\nMessage Type: ${msgType}\nTime Stamp: ${bkkTimeStamp}\nGroup Name: ${groupName}\nSender Name: ${senderName}\n\nMessage Content: ${msgContent}`
  //         }
  // ]
  // })
  // request.post({
  //     url: `${line_reply}`,
  //     headers: headers,
  //     body: body
  // }, (err, response, body) => {
  //     console.log('status of message sending= ' + response.statusCode);
  // });
}

async function getFileExtension(message, messageType) {
  let extension = '';
  switch (messageType) {
    case "image":
      extension = 'png';
      break;
    case "video":
      extension = 'mp4';
      break;
    case "audio":
      extension = 'm4a';
      break;
    case "file":
      const regex = /\.([0-9a-z]+)(?:[\?#]|$)/i;
      const match = regex.exec(message.fileName);
      extension = match ? match[1] : '';
      break;
  }
  return extension
}

async function saveToStorage(groupId, userId, message, extension, binaryData) {
  const storageBucket = Storage.storage.bucket(Storage.bucketName);
  const file = storageBucket.file(`${groupId}/${message.id}/${userId}.${extension}`);
  await file.save(binaryData);
  file.makePublic();
  return file.publicUrl();
}

async function insertFileByGroupId(groupId, userId, messageType, publicUrl, timestamp, date, extension){
  if (messageType === "file") {
    messageType = extension
  }
  await Storage.lineFileDB.add({
      groupId: groupId,
      messageType: messageType,
      userId: userId,
      publicUrl: publicUrl,
      timeStamp: timestamp,
      date: date
  })
}

module.exports = {processFile}