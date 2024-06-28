const fetch = require("node-fetch");
const fireStore = require("./fireStoreQuery");
const Storage = require("../initializeStorage");

const dates = ["19-June-2024", "20-June-2024", "21-June-2024", "24-June-2024"];
const groupIds = ["C9bd09a7782d6640b244bf2af602cdb8e"];

async function updateFirestoreCollection(groupIds, dates) {
  for (const date of dates) {
    for (const groupId of groupIds) {
      try {
        console.log(
          `Fetching sentiment scores for groupId: ${groupId} and date: ${date}`
        );
        const { analysisResults, sentimentResults } =
          await updateSentimentScores(groupId, date);

        if (!analysisResults || !sentimentResults) {
          throw new Error(
            `Invalid data for groupId: ${groupId} and date: ${date}`
          );
        }

        if (analysisResults.length > 0 && sentimentResults.length > 0) {
          await insertResponseByGroupId(
            groupId,
            date,
            analysisResults,
            sentimentResults
          );
          console.log("Analysis results:", analysisResults);
          console.log("Sentiment results:", sentimentResults);
        } else {
          console.log(
            `No data to insert for groupId: ${groupId} and date: ${date}`
          );
        }

        console.log(
          `Updated Firestore for groupId: ${groupId} and date: ${date}`
        );
      } catch (error) {
        console.error(
          `Error processing messages for groupId: ${groupId} and date: ${date}`,
          error
        );
      }
    }
  }
}

async function updateSentimentScores(groupId, date) {
  const url = `https://us-central1-line-ec275.cloudfunctions.net/LineBotYdm/updateSentiment/${groupId}/${date}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sentiment scores for groupId: ${groupId} and date: ${date}`
    );
  }
  const data = await response.json();
  console.log(data);
  return {
    analysisResults: data.score.analysisResults || [],
    sentimentResults: data.score.sentimentResults || [],
  };
}

async function insertResponseByGroupId(
  groupId,
  date,
  analysisResults,
  sentimentResults
) {
  const documentId = `${groupId}_${date}`;
  const docRef = Storage.gemResponse.doc(documentId);
  console.log(
    `Setting document ${documentId} with response: ${analysisResults} and score: ${sentimentResults}`
  );

  try {
    await docRef.set(
      {
        groupId: groupId,
        date: date,
        response: analysisResults,
        score: sentimentResults,
      },
      { merge: true }
    );
    console.log(`Document ${documentId} successfully written!`);
  } catch (error) {
    console.error(`Error writing document ${documentId}:`, error);
  }
}

updateFirestoreCollection().catch((error) => {
  console.error("Error updating Firestore collection:", error);
});
