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
          {text: "- กมรรัตน์ - กล่าวว่า: อันนี้เราเอาออกได้มั้ย\\n- กมรรัตน์ - กล่าวว่า: ตกใจกันหมด\\n- กมรรัตน์ - กล่าวว่า: แทนที่จะโชว์เป็นป๊อปอัพ ใส่เป็น console ดีกว่าป่าว\\nกับแก้ม กล่าวว่า: ตอนแรกจะใช้สำหรับเช็ก status line เลยมีเข้าไปเช็ก tag \\n\\nเบื้องต้น hide alert ไว้แล้วค่ะ อนาคตจะปรับไปใช้ console แทนค่ะ\\n- กมรรัตน์ - กล่าวว่า: มันคือ tag ไหนนะ\\n- กมรรัตน์ - กล่าวว่า: อันนี้ปะ\\n- กมรรัตน์ - กล่าวว่า: พรุ่งนี้ฝากสรุป performance campaign ให้หน่อยนะ ว่ามีคนกดเท่าไหร่ แอดเท่าไหร่ เรากำลังขอ open rate email อยู่\\nกับแก้ม กล่าวว่า: ใช่ค่า\\nกับแก้ม กล่าวว่า: รับทราบค่ะ\\nNESTA กล่าวว่า: @- กมรรัตน์ - คนซื้อ travel เราจะได้ hgc event ไหนครับ dev ไม่ได้ใส่ cookie profile เหมือน auto ใช่ป่าวครับ\\n- กมรรัตน์ - กล่าวว่า: ได้ที่หลังหน้า summary\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การปรับปรุงระบบและการติดตามผลการรณรงค์ทางการตลาด\n\n**อารมณ์ของผู้พูด:**\n\n* **กมรรัตน์:**  เป็นกลาง (Neutral)\n* **กับแก้ม:**  เป็นกลาง (Neutral)\n* **NESTA:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการปรับปรุงระบบและการติดตามผลการรณรงค์ทางการตลาด กมรรัตน์แสดงความกังวลเกี่ยวกับการแจ้งเตือนแบบป๊อปอัพ และเสนอให้ใช้คอนโซลแทน กับแก้มยืนยันว่าจะปรับปรุงระบบในอนาคต นอกจากนี้ กมรรัตน์ยังขอให้กับแก้มสรุปผลการรณรงค์ทางการตลาด และ NESTA ถามเกี่ยวกับข้อมูลของผู้ซื้อสินค้าประเภทท่องเที่ยว\n\n**จุดสำคัญ:**\n\n* กมรรัตน์เสนอให้ปรับปรุงระบบแจ้งเตือนจากป๊อปอัพเป็นคอนโซล\n* กับแก้มยืนยันว่าจะปรับปรุงระบบในอนาคต\n* กมรรัตน์ขอให้กับแก้มสรุปผลการรณรงค์ทางการตลาด\n* NESTA ถามเกี่ยวกับข้อมูลของผู้ซื้อสินค้าประเภทท่องเที่ยว\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "- กมรรัตน์ - กล่าวว่า: เบลได้ใส่ transgroup ไหมนะ เหมือนมันเข้า default\\nNESTA กล่าวว่า: ใส่ครับ\\nNESTA กล่าวว่า: เข้า default ทุกตัวเลยหรอครับ\\n- กมรรัตน์ - กล่าวว่า: ช่าย\\n- กมรรัตน์ - กล่าวว่า: อันนี้ 31 กะ 6\\n- กมรรัตน์ - กล่าวว่า: มีของวันไหนอีกไหม\\n- กมรรัตน์ - กล่าวว่า: banner add line ที่โชว์หน้า home set frequency กี่ครั้งนะ\\n- กมรรัตน์ - กล่าวว่า: วันละครั้งปะ\\n- กมรรัตน์ - กล่าวว่า: หรือเจอทุกครั้ง\\n- กมรรัตน์ - กล่าวว่า: ของพรีฝากเซ็ตให้เป็นแบบ prod หน่อย พอดีเค้าเทสงานกันแล้วเจอ แล้วแบบตกใจ\\nกับแก้ม กล่าวว่า: ปรับเป็นวันละครั้งที่แล้วค่ะ ก่อนหน้านี้เซ็ตไว้99ครั้ง ต่อวัน\\nกับแก้ม กล่าวว่า: พี่จอยคะแก้มมี recheck ข้อมูลวันนี้ ของ travel ยังไม่มีเข้ามานะคะ\\n- กมรรัตน์ - กล่าวว่า: อ่าว อีกแล้วรึ\\n- กมรรัตน์ - กล่าวว่า: แต่วันนั้นเข้าแล้วนิ\\n- กมรรัตน์ - กล่าวว่า: มันต้องไปดูรีพอร์ทยังไงนะแก้ม\\n- กมรรัตน์ - กล่าวว่า: สักสองครึ่งคุยกันได้มิ\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การตรวจสอบระบบและข้อมูลการตลาด\n\n**อารมณ์ของผู้พูด:**\n\n* **กมรรัตน์:**  กังวล (Negative)\n* **NESTA:**  เป็นกลาง (Neutral)\n* **กับแก้ม:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการตรวจสอบระบบและข้อมูลการตลาด กมรรัตน์แสดงความกังวลเกี่ยวกับการตั้งค่าระบบและข้อมูลการตลาดที่ไม่ถูกต้อง เช่น การตั้งค่า transgroup และการแสดงโฆษณาบนหน้า home  กับแก้มอธิบายว่าได้ปรับปรุงการแสดงโฆษณาแล้ว และแจ้งว่าข้อมูลการตลาดของสินค้าประเภทท่องเที่ยวยังไม่เข้าระบบ กมรรัตน์แสดงความกังวลและต้องการตรวจสอบข้อมูลเพิ่มเติม\n\n**จุดสำคัญ:**\n\n* กมรรัตน์กังวลเกี่ยวกับการตั้งค่า transgroup และการแสดงโฆษณาบนหน้า home\n* กับแก้มอธิบายว่าได้ปรับปรุงการแสดงโฆษณาแล้ว\n* กับแก้มแจ้งว่าข้อมูลการตลาดของสินค้าประเภทท่องเที่ยวยังไม่เข้าระบบ\n* กมรรัตน์ต้องการตรวจสอบข้อมูลเพิ่มเติมและนัดคุยกับกับแก้มในเวลา 14:30 น.\n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "กับแก้ม กล่าวว่า: ได้ค้ะพี่จอย\\n- กมรรัตน์ - กล่าวว่า: 0876980202 แก้มโทรหาเราหน่อยจ้า\\n- กมรรัตน์ - กล่าวว่า: มันเป็นการเอา data ที่ยิงใหม่ไป merge หรือว่า replace นะ\\n- กมรรัตน์ - กล่าวว่า: เราให้เค้ายิงไปให้ใหม่ละ\\nกับแก้ม กล่าวว่า: https://docs.google.com/spreadsheets/d/150mEEwiGGYp0bQsvx4mJLb2-2p6gDlt9zFGMP_5m7zQ/edit#gid=962126835\\nกับแก้ม กล่าวว่า: อันนี้ข้อมูลก่อนยิงเข้ามาใหม่ค่ะ\\n- กมรรัตน์ - กล่าวว่า: ได้ตอนหน้า checkout นะเบล เราลองเช็กละ @NESTA\\n- กมรรัตน์ - กล่าวว่า: อันนี้ใครตอบได้มั่ง\\nกับแก้ม กล่าวว่า: เป็นการ log data ต่อด้านล่างค่ะ\\n- กมรรัตน์ - กล่าวว่า: แต่ว่าเรายิงไปใหม่ทุกครั้ง หมายถึง เรายิงทั้งหมดใหม่อะ\\n- กมรรัตน์ - กล่าวว่า: แปลว่าแก้มจะเห็นดาต้าซ้ำๆ งี้หรอ\\n- กมรรัตน์ - กล่าวว่า: มียิงไปอีกรอบ ตอน \\nกับแก้ม กล่าวว่า: ถ้าtimestamp และ orderid เป็นเลขเดิม ข้อมูลจะเป็นอันเดิมค่ะ\\n\\nแต่ถ้ามีข้อมูลเพิ่มที่ มี timestamp และ orderid ไม่ซ้ำของเดิม ส่วนนี้จะถูกต่อข้อมูลเข้ามาเพิ่มค่ะ\\n\\n- กมรรัตน์ - กล่าวว่า: 6/10/2024 2:53:57 PM\\n- กมรรัตน์ - กล่าวว่า: อ๋าาา that's why\\n- กมรรัตน์ - กล่าวว่า: ที่ยิงใหม่ เราแก้ product_Type เป็น product_type\\nกับแก้ม กล่าวว่า: เดี๋ยวอักสักพักแก้มไปเช็กให้ค่ะ\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การตรวจสอบข้อมูลและการแก้ไขระบบ\n\n**อารมณ์ของผู้พูด:**\n\n* **กมรรัตน์:**  กังวล (Negative)\n* **กับแก้ม:**  เป็นกลาง (Neutral)\n* **NESTA:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการตรวจสอบข้อมูลและการแก้ไขระบบ กมรรัตน์แสดงความกังวลเกี่ยวกับการอัพเดทข้อมูลและการแก้ไขระบบ โดยเฉพาะการแก้ไขชื่อ product_Type เป็น product_type  กับแก้มอธิบายว่าระบบจะทำการ log ข้อมูลใหม่ต่อด้านล่างของข้อมูลเดิม และข้อมูลที่ซ้ำกันจะไม่ถูกบันทึก  กมรรัตน์เข้าใจเหตุผลและขอให้กับแก้มตรวจสอบข้อมูลเพิ่มเติม\n\n**จุดสำคัญ:**\n\n* กมรรัตน์กังวลเกี่ยวกับการอัพเดทข้อมูลและการแก้ไขระบบ\n* กับแก้มอธิบายว่าระบบจะทำการ log ข้อมูลใหม่ต่อด้านล่างของข้อมูลเดิม\n* กมรรัตน์เข้าใจเหตุผลและขอให้กับแก้มตรวจสอบข้อมูลเพิ่มเติม\n* กมรรัตน์แจ้งว่าได้แก้ไขชื่อ product_Type เป็น product_type \n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "กับแก้ม กล่าวว่า: ข้อมูล travel เข้าแล้วค่ะพี่จอย\\n\\nตอนนี้กำลังเช็กการเก็บข้อมูลเก่าบางส่วนของ DFN เพิ่มเติม ว่าจะมีรีเพลสไหม\\n\\nรบกวนสอบถามเพิ่มเติมปกติที่มีอัพเดท transaction เข้า Dfn ทุกวัน ส่งแค่เฉพาะข้อมูลใหม่ที่ต้องการอัพเดท หรือว่าเป็นข้อมูลทั้งหมดที่รวมทั้งใหม่และเก่าเลยคะ\\n- กมรรัตน์ - กล่าวว่า: ส่งทั้งหมดเลย ทั้งเก่าและใหม่\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การอัพเดทข้อมูลในระบบ DFN\n\n**อารมณ์ของผู้พูด:**\n\n* **กับแก้ม:**  เป็นกลาง (Neutral)\n* **กมรรัตน์:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการอัพเดทข้อมูลในระบบ DFN กับแก้มแจ้งว่าข้อมูลการท่องเที่ยวได้เข้าระบบแล้ว และกำลังตรวจสอบการเก็บข้อมูลเก่าของ DFN  กับแก้มสอบถามว่าการอัพเดทข้อมูลใน DFN ทุกวัน จะส่งเฉพาะข้อมูลใหม่หรือส่งข้อมูลทั้งหมด (รวมทั้งข้อมูลเก่า)  กมรรัตน์ตอบว่าส่งข้อมูลทั้งหมดทั้งเก่าและใหม่\n\n**จุดสำคัญ:**\n\n* ข้อมูลการท่องเที่ยวได้เข้าระบบ DFN แล้ว\n* กับแก้มกำลังตรวจสอบการเก็บข้อมูลเก่าของ DFN\n* การอัพเดทข้อมูลใน DFN ทุกวัน จะส่งข้อมูลทั้งหมดทั้งเก่าและใหม่ \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "\"MT กล่าวว่า: ปริม มาช อันดา พี่ติด track เว็บ corperate ลูกค้าทั้งสองเว็บแล้วนะ รายละเอียดอยู่ใน click up บ้านเรา \\n\\nแค่ facebook basecode / pageview (all page) / click button (all button) \\n\\n*ติดเพื่อทำ audience only!* not for event optimization \\n\\nเลือก page path ที่เป็นตาม step การซื้อของได้เลย page view add to cart / checkout / payment \\n\\nหรือเลือกปุ่ม ที่ชอบได้เลย เช่น คนกด ศูนย์บริการลูกค้า / สายเคลมด่วน\\n\\nแล้วก็รบกวน ขอ flow ที่มี url / page path ระบุ มาจากพี่ตูน จะได้ไม่ต้องลองซื้อกันจริง (ทั้งสองเว็บเลยนะ)\\n\\nfyi พี่มิ้น อิ้ง มุก สต และทุกคนที่ related\\nPrim กล่าวว่า: ดอเชชค่ะ \\nตรงเลือก Event ทำ audience อันนี้ขอไปเล่นดูก่อนมีอะไรน่าเก็บบ้าง\\n\\nส่วนตัว ขอ flow เดี๋ยวขอคุณตูนไม่ก็คุณบีใครมีข้อมูลก็ได้หมด ให้อีกทีค่ะ\\nPrim กล่าวว่า: โอ*\\nmugg✨ กล่าวว่า: เดี๋ยวปริม next step แบบนี้ \\n- ขอ page path ลูกค้า\\n- ลองสร้าง audience ดู ถ้าเป็นไปได้อยากได้ลึกที่สุดมาทำ lal / advantage \\nmugg✨ กล่าวว่า: @MT  ของ gg ได้ติดป่าวนะ หรือว่าสามารถดึง audience purchase จาก ga มาเป็น signal ได้ไหม\\nMT กล่าวว่า: ไม่ได้ติด เค้ามีติดอยู่แล้ว เลยไม่กล้าติด\\nMT กล่าวว่า: แต่คิดว่า ถ้าได้สิท GA ก็ดีงมาได้แหละ pageview\\nmugg✨ กล่าวว่า: โอเค(ok)\\nMT กล่าวว่า: ตอนนี้ได้แต่สิท GTM \\nMT กล่าวว่า: ถ้าพี่ปริมอยากใช้ พี่ปริมขอสิทให้พี่นะ\\nMT กล่าวว่า: GA measurement id นี้ G-0KRPY2CW9N\\n.🤍 INKARAT 🐳 กล่าวว่า: คุยแย้วว\\n.🤍 INKARAT 🐳 กล่าวว่า: คุณตูนต่อเรื่อยๆ\\n.🤍 INKARAT 🐳 กล่าวว่า: ส่วนเรื่อง dfin tracking web corporate เดี๋ยวเราโทรเล่าให้ฟัง\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การติดตามเว็บไซต์ของลูกค้าและการสร้างกลุ่มเป้าหมาย\n\n**อารมณ์ของผู้พูด:**\n\n* **MT:**  เป็นกลาง (Neutral)\n* **Prim:**  เป็นกลาง (Neutral)\n* **mugg✨:**  เป็นกลาง (Neutral)\n* **.🤍 INKARAT 🐳:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการติดตามเว็บไซต์ของลูกค้าและการสร้างกลุ่มเป้าหมาย MT แจ้งว่าได้ติดตามเว็บไซต์ของลูกค้าทั้งสองเว็บแล้ว และขอให้ Prim และทีมช่วยระบุ flow ของเว็บไซต์เพื่อสร้างกลุ่มเป้าหมาย  Prim ตอบรับและขอข้อมูลเพิ่มเติมจากคุณตูน  mugg✨ เสนอแนะวิธีการสร้างกลุ่มเป้าหมายและสอบถามเกี่ยวกับการติดตามข้อมูลใน Google Analytics  MT อธิบายว่ายังไม่ได้ติดตั้ง Google Analytics แต่สามารถขอสิทธิ์เข้าถึงข้อมูลได้  .🤍 INKARAT 🐳 แจ้งว่าได้คุยกับคุณตูนแล้วและจะโทรเล่ารายละเอียดเกี่ยวกับการติดตามเว็บไซต์ของลูกค้า\n\n**จุดสำคัญ:**\n\n* MT ได้ติดตามเว็บไซต์ของลูกค้าทั้งสองเว็บแล้ว\n* MT ขอให้ Prim และทีมช่วยระบุ flow ของเว็บไซต์เพื่อสร้างกลุ่มเป้าหมาย\n* mugg✨ เสนอแนะวิธีการสร้างกลุ่มเป้าหมายและสอบถามเกี่ยวกับการติดตามข้อมูลใน Google Analytics\n* MT อธิบายว่ายังไม่ได้ติดตั้ง Google Analytics แต่สามารถขอสิทธิ์เข้าถึงข้อมูลได้\n* .🤍 INKARAT 🐳 แจ้งว่าได้คุยกับคุณตูนแล้วและจะโทรเล่ารายละเอียดเกี่ยวกับการติดตามเว็บไซต์ของลูกค้า\n\n\n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Prim กล่าวว่า: โอเค \\nnext step \\n- ขอ page path ลูกค้า\\n- ลองสร้าง audience ดู ถ้าเป็นไปได้อยากได้ลึกที่สุดมาทำ lal / advantage \\n- ถ้าอยากเอา audience  จาก ga มาเป็น signal ใน GG แบบบ้าน ttb   ไปขอสิท GA มาเพราะตอนนี้เค้าให้แค่ GTM : ขอไปก่อน ขอให้หมด \\nMT กล่าวว่า: โมโหหรอ 55555\\nMT กล่าวว่า: จุ๊ๆ ไม่โมพี่\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** การขอสิทธิ์เข้าถึง Google Analytics\n\n**อารมณ์ของผู้พูด:**\n\n* **Prim:**  เป็นกลาง (Neutral)\n* **MT:**  สนุกสนาน (Positive)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับการขอสิทธิ์เข้าถึง Google Analytics Prim เสนอแนะขั้นตอนต่อไปในการสร้างกลุ่มเป้าหมาย โดยเน้นย้ำถึงความสำคัญของการขอสิทธิ์เข้าถึง Google Analytics เพื่อนำข้อมูลมาใช้ในการสร้างกลุ่มเป้าหมาย  MT ตอบกลับด้วยอารมณ์ขำขัน โดยแซว Prim ว่าโมโหหรือเปล่า\n\n**จุดสำคัญ:**\n\n* Prim เสนอแนะขั้นตอนต่อไปในการสร้างกลุ่มเป้าหมาย\n* Prim เน้นย้ำถึงความสำคัญของการขอสิทธิ์เข้าถึง Google Analytics\n* MT ตอบกลับด้วยอารมณ์ขำขัน โดยแซว Prim ว่าโมโหหรือเปล่า \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: ".🤍 INKARAT 🐳 กล่าวว่า: @🦋Mintt. TNI CDP Renewal budget allo\\n\\nJuly : https://docs.google.com/spreadsheets/d/1tOvtUkV1NxWG61-HxpxmHVWDe2NQcf4DIVz2iBfFzHk/edit#gid=2106133575\\nAug : https://docs.google.com/spreadsheets/d/1tOvtUkV1NxWG61-HxpxmHVWDe2NQcf4DIVz2iBfFzHk/edit#gid=858662019\\n.🤍 INKARAT 🐳 กล่าวว่า: @Prim ปริม ขอดูเงินที่จะใช้เดือนนี้หน่อยสิ จะออก QT ของเดือนนี้ไปเพิ่ม\\n🦋Mintt. กล่าวว่า: ข่อมค่า\\nPrim กล่าวว่า: เดะเช็คให้ ทุก product เลยบ่\\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "## การวิเคราะห์บทสนทนา\n\n**หัวข้อการสนทนา:** งบประมาณ CDP Renewal\n\n**อารมณ์ของผู้พูด:**\n\n* **.🤍 INKARAT 🐳:**  เป็นกลาง (Neutral)\n* **🦋Mintt.:**  เป็นกลาง (Neutral)\n* **Prim:**  เป็นกลาง (Neutral)\n\n**สรุปบริบท:**\n\nบทสนทนานี้เกิดขึ้นในกลุ่มแชทของที่ทำงาน เกี่ยวกับงบประมาณ CDP Renewal  .🤍 INKARAT 🐳 แจ้งงบประมาณสำหรับเดือนกรกฎาคมและสิงหาคม โดยให้ลิงก์ไปยังสเปรดชีต  .🤍 INKARAT 🐳 ขอให้ Prim ตรวจสอบงบประมาณที่จะใช้ในเดือนนี้เพื่อออก QT  🦋Mintt. ตอบรับ และ Prim ยืนยันว่าจะตรวจสอบงบประมาณของทุกผลิตภัณฑ์\n\n**จุดสำคัญ:**\n\n* .🤍 INKARAT 🐳 แจ้งงบประมาณ CDP Renewal สำหรับเดือนกรกฎาคมและสิงหาคม\n* .🤍 INKARAT 🐳 ขอให้ Prim ตรวจสอบงบประมาณที่จะใช้ในเดือนนี้\n* Prim ยืนยันว่าจะตรวจสอบงบประมาณของทุกผลิตภัณฑ์ \n"},
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