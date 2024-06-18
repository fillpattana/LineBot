const request = require("request");
const fireStore = require("../controller/fireStoreQuery");
const moment = require("moment-timezone");
var Storage = require("../initializeStorage");
require("dotenv").config();
const accessTok = process.env.ACCESS_TOKEN;
const line_reply = process.env.LINE_REPLY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessTok}`,
};

const processSentiment = async (reply_token, msg) => {
    await handleSentiment(reply_token, msg);
  };
  
  async function handleSentiment(reply_token, msg) {
    const timeStamp = msg.timestamp; // Assuming this is a string representing the timestamp
    const date = moment(timeStamp, "YYYY-MM-DDTHH:mm:ssZ").tz("Asia/Bangkok").format("DD-MMMM-YYYY");
    const groupId = msg.source.groupId;
  
    // Latest timestamp from Firestore
    const latestMessageTime = await fireStore.latestTimeStamp(groupId, date);
  
    if (latestMessageTime) {
      const latestMoment = moment(latestMessageTime).tz("Asia/Bangkok");
      const currentMoment = moment(timeStamp, "YYYY-MM-DDTHH:mm:ssZ").tz("Asia/Bangkok");
  
      // Check if the difference is above 30 minutes
      if (currentMoment.diff(latestMoment, "minutes") > 30) {
        //   insertResponseByGroupId(groupId, date);
        console.log("lesser than 30 minutes still same topic leave it be");
        console.log("currentMoment:", currentMoment);
        console.log("latestMoment:", latestMoment);
      }
    } else {
      // insertResponseByGroupId(groupId, date);
      console.log("greater than 30 minutes new topic compute sentiment score now");
      console.log("msgContent:", msgContent);
    }
  }
  
  async function insertResponseByGroupId(
    groupId,
    date,
    sentimentScore
  ) {
    const responseRef = Storage.gemResponse.doc(); // Create a new document reference
  
    // Use set with merge: true to either create the document or update it
    await responseRef.set(
      {
        groupId: groupId,
        date: date,
        sentimentScore: sentimentScore,
      },
      { merge: true }
    );
  }
  
  module.exports = { processSentiment };