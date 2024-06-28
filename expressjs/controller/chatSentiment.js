const moment = require("moment-timezone");
const Getter = require("./Getter");
const fireStore = require("./fireStoreQuery");
const Storage = require("../initializeStorage");
const Sentiment = require("./sentimentProcessor");

async function handleTextAndSentiment(reply_token, msg) {
  const msgType = msg.message.type;
  const msgContent = msg.message.text;
  const timeStamp = msg.timestamp;
  const bkkTimeStamp = moment(timeStamp)
    .tz("Asia/Bangkok")
    .format("DD-MMMM-YYYY-HH:mm:ss");
  const date = moment(timeStamp).tz("Asia/Bangkok").format("DD-MMMM-YYYY");
  const groupId = msg.source.groupId;
  const senderId = msg.source.userId;
  const groupName = await Getter.getGroupName(groupId);
  const senderName = await Getter.getSenderName(groupId, senderId);

  const formattedTimeStamp = moment(timeStamp).valueOf();

  console.log(
    `Text Metadata: , groupId: ${groupId}, senderId: ${senderId}, msgType: ${msgType}, msgContent: ${msgContent}, bkkTimeStamp: ${bkkTimeStamp}, date: ${date}`
  );

  // Fetch the latest timestamp before adding the new message
  const latestMessageTime = await fireStore.latestTimeStamp(groupId, date);

  // Insert text message metadata to the database
  await insertTextByGroupId(
    groupId,
    senderId,
    msgType,
    msgContent,
    bkkTimeStamp,
    date,
    formattedTimeStamp
  );

  let response;
  let score;

  if (latestMessageTime) {
    const latestMoment = moment(latestMessageTime).tz("Asia/Bangkok");
    const currentMoment = moment(timeStamp).tz("Asia/Bangkok");
    console.log("currentMoment", currentMoment);
    console.log("latestMoment:", latestMoment);
    const timeDifference = currentMoment.diff(latestMessageTime, "minutes");
    console.log("Time Difference:", timeDifference);

    // Check if the difference is above 30 minutes
    if (timeDifference > 30) {
      // Process messages for analysis and sentiment
      console.log("greater than 30 minutes, new interval");
      const results = await Sentiment.processMessages(groupId, date);
      response = results.analysisResults;
      score = results.sentimentResults;
    } else {
      console.log("lesser than 30 minutes, same interval");
    }
    console.log("currentMoment:", currentMoment);
    console.log("latestMoment:", latestMoment);
  } else {
    // Process messages for analysis and sentiment
    const results = await Sentiment.processMessages(groupId, date);
    response = results.analysisResults;
    score = results.sentimentResults;
    console.log("No previous message found, inserting new record.");
  }

  // Insert response and score into Firestore
  await insertResponseByGroupId(groupId, date, response, score);
}

async function insertTextByGroupId(
  groupId,
  userId,
  messageType,
  msgContent,
  timeStamp,
  date,
  formattedTimeStamp
) {
  await Storage.lineTextDB.add({
    groupId: groupId,
    userId: userId,
    messageType: messageType,
    msgContent: msgContent,
    timeStamp: timeStamp,
    date: date,
    formattedTimeStamp: formattedTimeStamp,
  });
  console.log("saved text metadatas into collection");
}

async function insertResponseByGroupId(groupId, date, response, score) {
  const documentId = `${groupId}_${date}`;
  const docRef = Storage.gemResponse.doc(documentId);
  await docRef.set(
    {
      groupId: groupId,
      date: date,
      response: response,
      score: score,
    },
    { merge: true }
  );
  console.log("Sentiment results saved into collection");
}

module.exports = { handleTextAndSentiment };
