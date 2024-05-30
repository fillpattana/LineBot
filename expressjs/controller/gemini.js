const { GoogleGenerativeAI} = require("@google/generative-ai");
const gemini_api = process.env.GEMINI_API
const genAI = new GoogleGenerativeAI(gemini_api);
const firebaseStorage = require('./storageQuery')

const singleImage = async (publicURL) => {
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
        let imageResult = await flashImage(url);
        imageResults += imageResult + '\n';
    }
    return imageResults;  
  }
  else {
    return "ไม่พบว่ามีภาพในข้อความ"
  }
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
  systemInstruction: "I need you to respond in Thai language. From a given body of conversation text. Your task is to identify the context of the conversation. Begin with a concise title for the topic of discussion, followed by the context summary itself, then finally the key messages of the conversation labelled with the sender's name as well.",
});

const gemFlashImage = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: "Identify and analyze these files; please respond in Thai.",
});

const gemFlashBoth = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: "From both these bodies of text, the first one is the result of a text analysis from you, the second one is the result of images analysis also by you. Both these are results of conversation summary of the same group chats. I need you to make a final summary to identify how the results of text and image analysis relate to one another along with its context. Thanks. Mind you if there's no image then dont randomly make one up please.",
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

async function flashText(textMessage) {
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
          {text: "## ประสบการณ์ไปงาน Partnership Committee ที่ Google\n\nบทสนทนานี้เป็นการเล่าประสบการณ์ของ Phil ที่ไปร่วมงาน Partnership Committee สำหรับที่ฝึกงานของเขา ซึ่งเป็นงานที่จัดโดย Google Phil รู้สึกตื่นเต้นและสนุกกับงานนี้ เพราะไม่เคยได้ไปงานแบบนี้มาก่อน และยังได้เรียนรู้ข้อมูลใหม่ๆ รวมถึงได้ทานอาหารอร่อยๆ อีกด้วย\n\n**Key Messages:**\n\n**Phil:**\n* ไปร่วมงาน Partnership Committee สำหรับที่ฝึกงาน\n* งานจัดโดย Google\n* รู้สึกตื่นเต้นและสนุกกับงาน\n* ได้เรียนรู้ข้อมูลใหม่ๆ\n* อาหารอร่อยมาก โดยเฉพาะ puff pastry ทูน่า\n* อยากไปงานแบบนี้อีก \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "phil กล่าวว่า: ช่วยเลือกรูปภาพหน่อยจะเอาไปลงไอจี phil กล่าวว่า: สองรูปนี้อันไหนดูดีสุด phil กล่าวว่า: ผมว่าจะลงแค่รูปเดียว phil กล่าวว่า: แต่ก็ไม่แน่ถ้าผ่านทั้ง2รูปก็ลงไปให้หมดเลย55555 phil กล่าวว่า: นี่ละอาทิตย์ที่แล้วช่วงเสาร์อาทิตย์เราไปวิ่งมาราธอนมาด้วย phil กล่าวว่า: ที่หัวหินอ่ะ phil กล่าวว่า: สนุกมากๆคือไม่เคยมีประสบการณ์แบบนั้นมาก่อน phil กล่าวว่า: ไม่ได้ยากมากนะ phil กล่าวว่า: วิ่งไป 10 กิโล phil กล่าวว่า: นี่ก็ที่ชายหาด phil กล่าวว่า: รูปไหนดูดีสุดไว้มากบอกด้วยละกันนะ phil กล่าวว่า: อยากฟังจากหลายๆมุมมอง phil กล่าวว่า: ขอบคุณมากๆเลยยยย"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## เลือกรูปลงไอจี\n\nบทสนทนานี้เป็นการขอความช่วยเหลือจากเพื่อนในการเลือกรูปภาพเพื่อลงไอจี Phil กำลังตัดสินใจระหว่างสองรูปภาพที่ถ่ายจากการวิ่งมาราธอนที่หัวหินเมื่อช่วงเสาร์อาทิตย์ที่ผ่านมา Phil อยากได้ความคิดเห็นจากเพื่อนๆ ว่ารูปไหนดูดีกว่ากัน และอยากฟังมุมมองจากหลายๆ คน \n\n**Key Messages:**\n\n**Phil:**\n* ขอความช่วยเหลือในการเลือกรูปภาพเพื่อลงไอจี\n* กำลังตัดสินใจระหว่างสองรูปภาพ\n* รูปภาพถ่ายจากการวิ่งมาราธอนที่หัวหิน\n* อยากได้ความคิดเห็นจากเพื่อนๆ ว่ารูปไหนดูดีกว่ากัน\n* อยากฟังมุมมองจากหลายๆ คน\n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(textMessage);
  console.log(result.response.text());
  return result.response.text();
}

async function flashImage(publicUrL) {
  console.log("Entered Flash Model Image Sending to Gemini")
  console.log("Public URL received", publicUrL)
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

async function flashBoth(textResults, imageResults) {
  const chatSession = gemFlashBoth.startChat({
    contextSummaryConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "## บทสนทนาสรุป **บริบทของผู้พูด:** Phil กำลังเล่าประสบการณ์การไปงาน Partnership Committee สำหรับฝึกงานของเขาที่ Google **สรุปบทสนทนา:** Phil เล่าถึงประสบการณ์การไปงาน Partnership Committee ที่ Google ซึ่งเป็นงานที่เขาตื่นเต้นและสนุกมาก เพราะไม่เคยได้ไปงานแบบนี้มาก่อน เขาเล่าถึงความประทับใจในอาหารช่วงพักเบรค โดยเฉพาะ puff pastry ทูน่าที่เขาชอบมาก นอกจากนี้เขายังประทับใจกับโรงอาหารของ Google ที่ทำอาหารอร่อยมาก Phil บอกว่าเขาอยากไปงานแบบนี้อีก เพราะได้ทั้งความรู้ ประสบการณ์ และอาหารอร่อย **ข้อสรุปสำคัญ:** * Phil มีประสบการณ์ที่ดีในการไปงาน Partnership Committee ที่ Google * เขาประทับใจกับอาหารช่วงพักเบรค โดยเฉพาะ puff pastry ทูน่า * เขาประทับใจกับโรงอาหารของ Google ที่ทำอาหารอร่อยมาก * เขาอยากไปงานแบบนี้อีก เพราะได้ทั้งความรู้ ประสบการณ์ และอาหารอร่อย"},
          {text: "ภาพนี้เป็นภาพของผนังไม้ที่ทาสีขาว มีการวาดรูปต้นไม้ด้วยสีดำและมีโลโก้ของ Google สีสันสดใสติดอยู่บนผนัง ทางด้านบนมีป้ายเขียนว่า \"Google (Thailand) Company Limited\" ภาพนี้บ่งบอกถึงสถานที่ทำงานของ Google ในประเทศไทย ซึ่งเป็นบริษัทเทคโนโลยีระดับโลก และสะท้อนถึงความทันสมัยและความคิดสร้างสรรค์ของบริษัท ภาพแสดงบุคคลคนหนึ่งกำลังหยิบอาหารจากบุฟเฟ่ต์ที่มีอาหารวางเรียงรายบนโต๊ะ ภายในห้องอาหาร บุคคลที่อยู่ในภาพสวมเสื้อสีขาว และกำลังหยิบอาหารในจานใส่ลงไปในจานของตัวเอง ในภาพยังเห็นบุคคลอีกคนหนึ่งยืนอยู่ด้านหลังเคาน์เตอร์บุฟเฟ่ต์ ซึ่งเป็นคนเตรียมอาหารและจัดเรียงอาหารให้เรียบร้อย มีอาหารหลากหลายชนิด เช่น ผัก ผลไม้ เนื้อสัตว์ และขนมปัง การจัดวางอาหารในบุฟเฟ่ต์แสดงให้เห็นถึงความสะอาด เรียบร้อย และน่ารับประทาน ซึ่งเป็นสิ่งสำคัญในการดึงดูดลูกค้าให้มาใช้บริการ ภาพนี้แสดงให้เห็นถึงบุคลากรหลายคนกำลังยืนอยู่หน้าป้ายโลโก้ Google โดยโลโก้ถูกสร้างขึ้นจากตัวอักษรขนาดใหญ่ สีแดง ขาว และดำ ในขณะเดียวกัน ในด้านหน้าของรูปภาพ มีการวางขนมปังและขนมชนิดอื่น ๆ บนจาน บ่งบอกถึงการจัดงานเลี้ยงหรือการจัดงานสังสรรค์ ซึ่งเป็นบรรยากาศที่อบอุ่น และเป็นกันเอง"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "จากการวิเคราะห์ทั้งข้อความและภาพ บ่งบอกถึงประสบการณ์ของ Phil ในงาน Partnership Committee ที่ Google (Thailand) Company Limited ซึ่งเป็นงานที่จัดขึ้นในบรรยากาศที่เป็นกันเองและอบอุ่น \n\n**ข้อความ** เน้นไปที่ประสบการณ์ส่วนตัวของ Phil โดยเฉพาะความประทับใจในอาหาร โดยเฉพาะ puff pastry ทูน่า และโรงอาหารของ Google ที่ทำอาหารอร่อยมาก \n\n**ภาพ** เสริมภาพลักษณ์ของสถานที่จัดงาน โดยแสดงให้เห็นถึงบรรยากาศการจัดงานเลี้ยงหรือสังสรรค์ ซึ่งเป็นบรรยากาศที่อบอุ่นและเป็นกันเอง นอกจากนี้ยังแสดงให้เห็นถึงความสะอาดและน่ารับประทานของอาหารในบุฟเฟ่ต์ ซึ่งสอดคล้องกับความประทับใจของ Phil ในข้อความ\n\n**สรุป** ทั้งข้อความและภาพแสดงให้เห็นถึงประสบการณ์ที่ดีของ Phil ในงาน Partnership Committee ที่ Google (Thailand) Company Limited ซึ่งเป็นงานที่เต็มไปด้วยความสนุกสนาน อาหารอร่อย และบรรยากาศที่เป็นกันเอง \n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(textResults, imageResults);
  return result.response.text();
}

module.exports = { singleImage, multipleImageByArray, textOnly, bothTextandImage, flashText, flashImage, flashBoth };