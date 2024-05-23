const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const gemini_api = process.env.GEMINI_API
const genAI = new GoogleGenerativeAI(gemini_api);
const firebaseStorage = require('./storageQuery')

const singleImage = async (publicURL) => {
  console.log("Entered ImageOnly Function:")
  console.log("PublicURL:", publicURL)
  const imageBinary = await firebaseStorage.extractFileBinaryFromStorage(publicURL)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const prompt = "ช่วยบรรยายภาพนี้ให้หน่อย";
  const mimeType = "image/png";

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
  if (arrayOfImgUrls && arrayOfImgUrls.length > 0) {
      for (const url of arrayOfImgUrls) {
          let imageResult = await gemImageFlash(url);
          imageResults += imageResult + '\n';
        }
  }
  return imageResults;
};

const textOnly = async (textMessages) => {
  if (!textMessages || textMessages.length === 0) {
    return "There's no text yet";
  }

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

const gemFlashText = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: "I need you to respond in Thai language. From a given body of conversation text. Your task is to identify what the context of each speaker is, provide a concise summary of the whole conversation, and finally the key takeaways of the conversation. In organized bullet points please.",
});

const gemFlashImage = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: "Identify and analyze these files; please respond in Thai.",
});

const contextSummaryConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const imageSummaryConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "image/png",
};

async function gemTextFlash(textMessages) {
  const chatSession = gemFlashText.startChat({
    contextSummaryConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "phil กล่าวว่า: สวัสดี phil กล่าวว่า: เมื่อ 2 อาทิตย์ที่แล้วเราไปงาน partnership commitee สำหรับที่ฝึกงานเรามาด้วย phil กล่าวว่า: Partnership เป็น google! phil กล่าวว่า: ทั้งตื่นเต้นและสนุกเลยแหละ phil กล่าวว่า: ไม่เคยได้ไปงานแบบนี้มาก่อน phil กล่าวว่า: บางข้อมูลเป็น nda เราจึงไม่พูดดีกว่า phil กล่าวว่า: แต่ ของกินช่วงพักเบรคอร่อยมากๆ phil กล่าวว่า: มีทั้ง puff pastry ใส้กรอกที่ดีสุดๆ มีพายสะปะรดที่อร่อยมากๆ phil กล่าวว่า: แต่ของโปรดเราเลยจะเป็น puff pastry ทูน่าอ่ะ อันนั้นที่ 1 phil กล่าวว่า: โรงอาหารเขาก็ทำอาหารได้อร่อยเกินหน้าเกินตามาก phil กล่าวว่า: อยากไปอีกเลย! phil กล่าวว่า: นอกจากความรู้ ประสบการณ์ ยังได้กินของอร่อยอีกอ่ะ 55555 ใครจะไม่อยากไปใช่มะ"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## บทสนทนาสรุป\n\n**บริบทของผู้พูด:**  Phil กำลังเล่าประสบการณ์การไปงาน Partnership Committee สำหรับฝึกงานของเขาที่ Google \n\n**สรุปบทสนทนา:** Phil เล่าถึงประสบการณ์การไปงาน Partnership Committee ที่ Google ซึ่งเป็นงานที่เขาตื่นเต้นและสนุกมาก เพราะไม่เคยได้ไปงานแบบนี้มาก่อน  เขาเล่าถึงความประทับใจในอาหารช่วงพักเบรค โดยเฉพาะ puff pastry ทูน่าที่เขาชอบมาก  นอกจากนี้เขายังประทับใจกับโรงอาหารของ Google ที่ทำอาหารอร่อยมาก  Phil บอกว่าเขาอยากไปงานแบบนี้อีก เพราะได้ทั้งความรู้ ประสบการณ์ และอาหารอร่อย\n\n**ข้อสรุปสำคัญ:**\n\n* Phil มีประสบการณ์ที่ดีในการไปงาน Partnership Committee ที่ Google\n* เขาประทับใจกับอาหารช่วงพักเบรค โดยเฉพาะ puff pastry ทูน่า\n* เขาประทับใจกับโรงอาหารของ Google ที่ทำอาหารอร่อยมาก\n* เขาอยากไปงานแบบนี้อีก เพราะได้ทั้งความรู้ ประสบการณ์ และอาหารอร่อย\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "phil กล่าวว่า: ช่วยเลือกรูปภาพหน่อยจะเอาไปลงไอจี phil กล่าวว่า: สองรูปนี้อันไหนดูดีสุด phil กล่าวว่า: ผมว่าจะลงแค่รูปเดียว phil กล่าวว่า: แต่ก็ไม่แน่ถ้าผ่านทั้ง2รูปก็ลงไปให้หมดเลย55555 phil กล่าวว่า: นี่ละอาทิตย์ที่แล้วช่วงเสาร์อาทิตย์เราไปวิ่งมาราธอนมาด้วย phil กล่าวว่า: ที่หัวหินอ่ะ phil กล่าวว่า: สนุกมากๆคือไม่เคยมีประสบการณ์แบบนั้นมาก่อน phil กล่าวว่า: ไม่ได้ยากมากนะ phil กล่าวว่า: วิ่งไป 10 กิโล phil กล่าวว่า: นี่ก็ที่ชายหาด phil กล่าวว่า: รูปไหนดูดีสุดไว้มากบอกด้วยละกันนะ phil กล่าวว่า: อยากฟังจากหลายๆมุมมอง phil กล่าวว่า: ขอบคุณมากๆเลยยยย "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## บทสนทนาสรุป\n\n**บริบทของผู้พูด:** Phil กำลังขอความช่วยเหลือในการเลือกรูปภาพเพื่อลง Instagram โดยเขาต้องการเลือกระหว่างสองรูปที่ถ่ายจากการวิ่งมาราธอนที่หัวหิน\n\n**สรุปบทสนทนา:** Phil เล่าถึงประสบการณ์การวิ่งมาราธอนที่หัวหิน ซึ่งเป็นประสบการณ์ใหม่สำหรับเขา  เขาบอกว่าสนุกมากและไม่ได้ยากมาก  เขาเลือกวิ่งระยะทาง 10 กิโลเมตร  Phil แสดงรูปภาพสองรูปที่ถ่ายจากการวิ่งมาราธอนและขอความช่วยเหลือในการเลือกรูปภาพเพื่อลง Instagram  เขาต้องการฟังความคิดเห็นจากหลายๆ มุมมอง\n\n**ข้อสรุปสำคัญ:**\n\n* Phil ไปวิ่งมาราธอนที่หัวหินเป็นครั้งแรก\n* เขาเลือกวิ่งระยะทาง 10 กิโลเมตร\n* เขาต้องการเลือกรูปภาพเพื่อลง Instagram \n* เขาต้องการฟังความคิดเห็นจากหลายๆ มุมมอง \n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(textMessages);
  console.log(result.response.text());
  return result.response.text();
}

async function gemImageFlash(publicUrL) {
  const imageBinary = await firebaseStorage.extractFileBinaryFromStorage(publicUrL)
  const mimeType = "image/png";

  const imageParts = [
    {
      inlineData: {
        data: Buffer.from(imageBinary, "binary").toString("base64"),
        mimeType
      }
    }
  ];

  const chatSession = gemFlashImage.startChat({
    imageSummaryConfig
  });

  const result = await chatSession.sendMessage(imageParts);
  console.log(result.response.text());
  return result.response.text();
}

module.exports = { singleImage, multipleImageByArray, textOnly, bothTextandImage, gemTextFlash, gemImageFlash };