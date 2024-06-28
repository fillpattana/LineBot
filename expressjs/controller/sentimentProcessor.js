const fireStore = require('./fireStoreQuery');
const Gemini = require('./gemini')

async function processMessages(groupId, date) {
  // Fetch messages
  const messages = await fireStore.getTextByDateOrderByAsc(groupId, date);
  // Separate messages into topics
  const topics = await fireStore.textMessageByTopic(messages);
  // Process each topic for analysis and sentiment
  let analysisResults = [];
  let sentimentResults = [];

  for (let topic of topics) {
    const analysis = await Gemini.flashText(topic);
    const sentiment = await Gemini.flashSentiment(topic);
    analysisResults.push(analysis);
    sentimentResults.push(sentiment);
  }

  // Combine the results as needed
  return { analysisResults, sentimentResults };
}

module.exports = { processMessages };
