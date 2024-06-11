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
  systemInstruction: "I will be providing you with a set of conversations from a workplace group chat and I need you to respond in Thai language.\n1. Name the topic of conversation.\n2. Identify the sentiment of each speaker.\n3. Provide a digestible context summary of the conversation in bullets.",
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
          {text: "phil กล่าวว่า: hello phil กล่าวว่า: I like how this man dresses phil กล่าวว่า: his taste of fashion is the taste I am interested in phil กล่าวว่า: Look at the boots and pants! phil กล่าวว่า: it fits together so well! phil กล่าวว่า: but they’re quite expensive phil กล่าวว่า: so buying exactly what he wears should be too pricey phil กล่าวว่า: ill just find alternatives haha"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** แฟชั่นของผู้ชาย\n\n**อารมณ์ของผู้พูด:**\n\n* **Phil:**  ตื่นเต้น, ชื่นชม, สนใจ,  กังวลเรื่องราคา\n\n**สรุปบทสนทนา:**\n\nPhil กำลังพูดถึงแฟชั่นของผู้ชายคนหนึ่งที่เขาชื่นชอบ โดยเฉพาะรองเท้าบูทและกางเกงที่เข้ากันได้ดี Phil ชื่นชมสไตล์ของผู้ชายคนนี้ แต่กังวลว่าราคาของเสื้อผ้าเหล่านั้นอาจแพงเกินไป เขาจึงวางแผนที่จะหาทางเลือกอื่นแทน\n\n**ข้อสรุป:**\n\nPhil ชื่นชอบสไตล์แฟชั่นของผู้ชายคนนี้ แต่เนื่องจากราคาแพง เขาจึงตัดสินใจหาทางเลือกอื่นที่ราคาถูกกว่า \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "phil กล่าวว่า: Good afternoon! phil กล่าวว่า: I am attending a seminar at my internship place phil กล่าวว่า: this program is provides knowledgeable take aways about how we can utilize AI in the workplace phil กล่าวว่า: All in all has been entertaining and interesting phil กล่าวว่า: I do find some things useful phil กล่าวว่า: And the key take aways is not to prompt models in thai language!"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:**  สัมมนาเกี่ยวกับ AI ในที่ทำงาน\n\n**อารมณ์ของผู้พูด:**\n\n* **Phil:**  ตื่นเต้น, สนใจ, พอใจ,  ได้ประโยชน์\n\n**สรุปบทสนทนา:**\n\nPhil กำลังเล่าถึงประสบการณ์การเข้าร่วมสัมมนาเกี่ยวกับ AI ที่สถานที่ฝึกงานของเขา เขาพบว่าสัมมนานี้ให้ความรู้และน่าสนใจ มีประโยชน์สำหรับการนำ AI มาใช้ในที่ทำงาน และเขาได้เรียนรู้ว่าไม่ควรใช้ภาษาไทยในการถามคำถามกับ AI models\n\n**ข้อสรุป:**\n\nPhil ได้รับประโยชน์จากสัมมนาเกี่ยวกับ AI และได้เรียนรู้ข้อควรระวังในการใช้ภาษาไทยกับ AI models \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "phil กล่าวว่า: สวัสดี phil กล่าวว่า: เมื่อ 2 อาทิตย์ที่แล้วเราไปงาน partnership commitee สำหรับที่ฝึกงานเรามาด้วย phil กล่าวว่า: Partnership เป็น google! phil กล่าวว่า: ทั้งตื่นเต้นและสนุกเลยแหละ phil กล่าวว่า: ไม่เคยได้ไปงานแบบนี้มาก่อน phil กล่าวว่า: บางข้อมูลเป็น nda เราจึงไม่พูดดีกว่า phil กล่าวว่า: แต่ ของกินช่วงพักเบรคอร่อยมากๆ phil กล่าวว่า: มีทั้ง puff pastry ใส้กรอกที่ดีสุดๆ มีพายสะปะรดที่อร่อยมากๆ phil กล่าวว่า: แต่ของโปรดเราเลยจะเป็น puff pastry ทูน่าอ่ะ อันนั้นที่ 1 phil กล่าวว่า: โรงอาหารเขาก็ทำอาหารได้อร่อยเกินหน้าเกินตามาก phil กล่าวว่า: อยากไปอีกเลย! phil กล่าวว่า: นอกจากความรู้ ประสบการณ์ ยังได้กินของอร่อยอีกอ่ะ 55555 ใครจะไม่อยากไปใช่มะ"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:**  งาน Partnership Committee กับ Google\n\n**อารมณ์ของผู้พูด:**\n\n* **Phil:**  ตื่นเต้น, สนุก, พอใจ,  ประทับใจ,  อยากไปอีก\n\n**สรุปบทสนทนา:**\n\nPhil เล่าถึงประสบการณ์การไปงาน Partnership Committee กับ Google ซึ่งเป็นสถานที่ฝึกงานของเขา เขาตื่นเต้นและสนุกกับงานนี้ เพราะไม่เคยได้ไปงานแบบนี้มาก่อน แม้ว่าจะมีข้อมูลบางอย่างที่เป็น NDA (ข้อตกลงไม่เปิดเผยข้อมูล) แต่ Phil ก็ประทับใจกับอาหารว่างช่วงพักเบรค โดยเฉพาะ puff pastry ทูน่าที่เขาชื่นชอบมาก เขาประทับใจกับอาหารและบรรยากาศของงานนี้ และอยากไปอีก\n\n**ข้อสรุป:**\n\nPhil มีประสบการณ์ที่ดีจากงาน Partnership Committee กับ Google โดยเฉพาะอาหารว่างที่อร่อยและบรรยากาศของงาน \n\n\n"},
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