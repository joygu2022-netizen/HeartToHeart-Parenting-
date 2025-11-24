import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Attachment, ChildProfile, AssessmentDefinition, Language } from "../types";
import { getAssessmentLibrary } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// --- Audio Helper Functions ---
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const addWavHeader = (pcmData: Uint8Array, sampleRate: number): ArrayBuffer => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcmData);
  return buffer;
};

// --- End Helper Functions ---

const getSystemInstruction = (lang: Language) => {
  // Generate assessment list context based on language
  const ASSESSMENT_LIBRARY = getAssessmentLibrary(lang);
  const ASSESSMENT_LIST_CONTEXT = Object.entries(ASSESSMENT_LIBRARY).flatMap(([ageGroup, tests]) => {
    return tests.map(t => `ID: ${t.id} (Title: ${t.title}, AgeGroup: ${ageGroup})`);
  }).join('; ');

  return `
    You are "HeartToHeart" (心连心), a professional, empathetic parenting and educational consultant.
    Your audience includes both PARENTS and TEACHERS of children aged 1-18.

    **CRITICAL LANGUAGE RULE**: 
    - **You MUST reply entirely in ${lang === 'zh' ? 'Simplified Chinese (简体中文)' : 'English'}.**
    - Do not mix languages unless explaining a term.

    **METHODOLOGY & PHILOSOPHY**:
    1.  **Expert Knowledge**: Integrate insights from **Adlerian Psychology (Positive Discipline)**, **Montessori**, **Carl Jung**, **Jean Piaget**, and **Ben Furman's "Kid's Skills" (Finnish method)**.
    2.  **Kid's Skills Approach (CRITICAL)**: 
        - When a user presents a behavioral problem, **DO NOT just give advice**.
        - **Reframe the problem as a "Skill to be Learned".** 
        - Example: Instead of saying "Stop interrupting," suggest the child needs to learn the skill of "Listening" or "Waiting for a turn".
        - Ask the user: "What skill does the child need to learn so they don't need this problem behavior anymore?"

    **ASSESSMENT RECOMMENDATIONS (ACTIONABLE LINKS)**:
    - We have a library of professional assessments: [${ASSESSMENT_LIST_CONTEXT}].
    - If a user describes symptoms (e.g., ADHD, Autism, Depression) or asks for a checkup, you MUST recommend the specific test using a **SPECIAL LINK FORMAT**.
    - **Format**: \`[Assessment Title](assessment:ID?age=X&gender=Y&role=Z)\`
      - **ID**: The exact ID from the list above.
      - **age**: The child's specific age (e.g. "5", "3.5") if the user mentioned it.
      - **gender**: "boy", "girl" if mentioned.
      - **role**: "parent" or "teacher" if known.
    - **Example**: "I recommend you try the [Attention Assessment](assessment:attention_snap?age=7&gender=boy&role=teacher)."

    Response Format:
    - Use clear headers.
    - If suggesting a solution, include a specific "Skill to Practice" section.
  `;
};

export const sendMessageToGemini = async (
  message: string,
  attachments: Attachment[] = [],
  lang: Language = 'zh'
): Promise<string> => {
  if (!apiKey) {
    return lang === 'zh' ? "请配置 API Key 以使用 AI 咨询功能。" : "Please configure your API Key.";
  }

  try {
    const parts: any[] = [];
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
      if (!message.trim()) {
        parts.push({ text: lang === 'zh' ? "请分析附件并提供建议。" : "Please analyze the attachment." });
      }
    }
    if (message.trim()) {
      parts.push({ text: message });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: getSystemInstruction(lang),
        temperature: 0.7,
      }
    });

    return response.text || (lang === 'zh' ? "暂时无法生成回复。" : "Could not generate response.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'zh' ? "连接服务器失败，请稍后再试。" : "Connection error, please try again.";
  }
};

export const generateAssessmentReport = async (
  profile: ChildProfile,
  assessmentTitle: string,
  answers: { question: string; answer: string }[],
  lang: Language
): Promise<string> => {
   if (!apiKey) return "API Key missing.";

   const genderText = profile.gender === 'boy' ? 'Boy' : profile.gender === 'girl' ? 'Girl' : 'Student/Child';
   const roleText = profile.role === 'teacher' ? 'Teacher' : 'Parent';
   const locationContext = profile.role === 'teacher' ? 'Classroom/School' : 'Home';
   const languageInstruction = lang === 'zh' ? 'Output STRICTLY in Simplified Chinese.' : 'Output STRICTLY in English.';

   const prompt = `
      ${languageInstruction}
      Role: Senior Child Psychologist & Educational Consultant.
      User Role: ${roleText}.
      Context: ${locationContext}.
      
      Task: Analyze the "${assessmentTitle}" for a ${profile.exactAge} old ${genderText}.

      Assessment Responses:
      ${answers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}

      Please provide a professional, structured report in ${lang === 'zh' ? 'Chinese' : 'English'}.
      
      Structure:
      1. **Evaluation Summary**: Based on the answers, what is the level of concern? (Low/Moderate/High). Be objective but gentle.
      2. **Interpretation**: What do these behaviors mean developmentally or psychologically?
      3. **Actionable Strategies for a ${roleText.toUpperCase()}**:
         - Provide 3 specific, actionable strategies applicable to the **${locationContext}**. 
         - **Kid's Skills Integration**: Identify 1 specific "Skill" the child needs to learn to overcome these challenges.
      4. **Next Steps**: When to seek professional medical/psychological help?

      Tone: Professional, supportive, constructive.
      `;

   try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Could not generate report.";
   } catch (error) {
     console.error("Report Generation Error", error);
     return "Error generating report.";
   }
};

export const generateContextualTip = async (context: string, isPremium: boolean = false, lang: Language = 'zh'): Promise<string> => {
  if (!apiKey) return lang === 'zh' ? "每个孩子都是静待花开的种子。" : "Every child is a flower waiting to bloom.";
  
  const standardPrompt = `
    Based on this context: "${context}", generate a single, short, inspiring "Daily Tip" (max 35 words). 
    Draw wisdom from educational experts like Montessori or Adler.
    Output language: ${lang === 'zh' ? 'Simplified Chinese' : 'English'}.
  `;

  const premiumPrompt = `
    You are an exclusive VIP parenting coach for a premium subscriber.
    Context of recent parent activity: "${context}".
    
    Generate a **Deep, Insightful, and Highly Personalized Tip** (max 50 words).
    - Go beyond generic advice. Provide a psychological nugget or a specific "Aha!" moment related to their recent query/activity.
    - Tone: Exclusive, warm, sophisticated, and deeply empowering.
    - Output language: ${lang === 'zh' ? 'Simplified Chinese' : 'English'}.
  `;

  const prompt = isPremium ? premiumPrompt : standardPrompt;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text?.trim() || (lang === 'zh' ? "鼓励是孩子心灵的阳光。" : "Encouragement is sunlight to the soul.");
  } catch (e) {
    return lang === 'zh' ? "鼓励是孩子心灵的阳光。" : "Encouragement is sunlight to the soul.";
  }
};

export const generateScenarioExample = async (
  profile: ChildProfile,
  problemTitle: string,
  lang: Language = 'zh',
  isRetry: boolean = false
): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  const isTeacher = profile.role === 'teacher';
  
  const prompt = `
    Generate a "Positive Discipline" role-play script.
    Output Language: ${lang === 'zh' ? 'Simplified Chinese' : 'English'}.
    
    **Scenario Details:**
    - **Adult Role**: ${isTeacher ? 'Teacher' : 'Parent'}
    - **Child Age**: ${profile.exactAge}
    - **Challenge**: ${problemTitle}

    **Output Format:**
    1. **Typical Negative Reaction**: Dialogue showing negative approach.
    2. **Positive Discipline Approach**: Dialogue showing Kind and Firm approach.
    3. **Skill Reframing**: One sentence identifying the specific skill (Kid's Skills).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: isRetry ? 0.9 : 0.7
      }
    });
    return response.text || "Could not generate example.";
  } catch (e) {
    return "Example generation unavailable.";
  }
};

export const generateBedtimeStory = async (
  childName: string,
  age: string,
  skillToLearn: string,
  issueToCorrect: string,
  characterVoiceId: string = 'default',
  lang: Language = 'zh'
): Promise<{ text: string; audioBase64: string; mimeType: string }> => {
  if (!apiKey) throw new Error("API Key missing");

  // Voice Mapping Logic
  let voiceName = 'Fenrir'; 

  switch (characterVoiceId) {
    case 'superman': voiceName = 'Fenrir'; break;
    case 'paw_chase': voiceName = 'Puck'; break;
    case 'ultraman': voiceName = 'Fenrir'; break;
    case 'minnie': voiceName = 'Aoede'; break;
    case 'elsa': voiceName = 'Zephyr'; break;
    case 'peppa': voiceName = 'Puck'; break;
    case 'spongebob': voiceName = 'Puck'; break;
    case 'doraemon': voiceName = 'Kore'; break;
    case 'totoro': voiceName = 'Fenrir'; break;
    default: voiceName = 'Zephyr';
  }

  // 1. Generate Story Text
  const storyPrompt = `
    Write a short, soothing bedtime story (approx. 200 words) for a ${age}-year-old child named "${childName}".
    
    **Educational Goal**:
    - Learn skill: "${skillToLearn}".
    - Address behavior: "${issueToCorrect}".
    - Use "Kid's Skills" philosophy.
    - **Language**: ${lang === 'zh' ? 'Simplified Chinese' : 'English'}.
    - **Tone**: Warm, magical, encouraging.
    
    Structure: Intro, Challenge, Solution, Happy Ending.
  `;

  let storyText = "";
  try {
    const textResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: storyPrompt,
    });
    storyText = textResponse.text || (lang === 'zh' ? "很久很久以前..." : "Once upon a time...");
  } catch (e) {
    console.error("Story Text Error", e);
    throw new Error("Failed to generate story text");
  }

  // 2. Generate Audio (TTS)
  try {
    const audioResponse = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: storyText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });
    
    const part = audioResponse.candidates?.[0]?.content?.parts?.[0];
    const rawAudioBase64 = part?.inlineData?.data;
    
    if (!rawAudioBase64) throw new Error("No audio data returned");

    const pcmBytes = base64ToUint8Array(rawAudioBase64);
    const wavBuffer = addWavHeader(pcmBytes, 24000);
    const wavBase64 = arrayBufferToBase64(wavBuffer);

    return {
      text: storyText,
      audioBase64: wavBase64,
      mimeType: "audio/wav"
    };

  } catch (e) {
    console.error("TTS Error", e);
    return { text: storyText, audioBase64: "", mimeType: "" };
  }
};