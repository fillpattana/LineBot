const { GoogleGenerativeAI } = require("@google/generative-ai");
const gemini_api = process.env.GEMINI_API
const genAI = new GoogleGenerativeAI(gemini_api);
const firebaseStorage = require('./storageQuery')

const singleImage = async (publicURL) => {
  console.log("Entered ImageOnly Function:")
  console.log("PublicURL:", publicURL)
  const imageBinary = await firebaseStorage.extractFileBinaryFromStorage(publicURL)
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  const prompt = "ช่วยบรรยายภาพนี้ให้หน่อย";
  const mimeType = "image/png";

  // Convert image binary to a GoogleGenerativeAI.Part object.
  const imageParts = [
    {
      inlineData: {
        data: Buffer.from(imageBinary, "binary").toString("base64"),
        mimeType
      }
    }
  ];
  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text();
  return text;
};

const multipleImageByArray = async (arrayOfImgUrls) => {
  console.log("Entered TextandImage function")
  let imageResults = '';
  // Call imageOnly function for each publicURL in the array
  if (arrayOfImgUrls && arrayOfImgUrls.length > 0) {
      for (const url of arrayOfImgUrls) {
          let imageResult = await singleImage(url);
          // Concatenate the imageResult strings into one large string
          imageResults += imageResult + '\n';
        }
  }
  return imageResults;
};

const textOnly = async (textMessages) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "1. summarize the context of each speaker (also include speaker names), 2. provide the key points from the conversation, 3. in a very concise manner capture the idea of the whole conversation (also include links if there are any since they are most likely very important). Respond in thai please.";
    const result = await model.generateContent([prompt, ...textMessages]);
    const text = result.response.text();
    return text;
};

const bothTextandImage = async (textResults, imageResults) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = "Relate and summarize the context of the image descriptions with the context of the chat analysis into a single paragraph that summarizes the content of all of them accurately without leaving out any key details please"
  const result = await model.generateContent([prompt, ...textResults, ...imageResults]);
  const text = result.response.text();
  return text;
}

module.exports = { singleImage, multipleImageByArray, textOnly, bothTextandImage };