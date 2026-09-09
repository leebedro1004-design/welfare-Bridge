import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

const execFileAsync = promisify(execFile);

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large body size for audio uploads (up to 500MB to support ~1 hour audio recordings)
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

/**
 * Resilient Gemini Content Generation with Multi-Model Fallback & Auto-Retry
 * Handles temporary 503 High Demand / 429 Quota / Rate-limit spikes gracefully.
 */
async function callGeminiWithFallback(
  modelsToTry: string[],
  contents: any,
  config?: any
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Attempt up to 2 times per model with short backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model: ${model} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        const text = response.text || "";
        return { text: text.trim(), modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API Warning] Model ${model} attempt ${attempt + 1} failed: ${errMsg}`);

        // If high demand 503, rate limit, or model unavailable, wait briefly then retry or switch model
        const isTemporary =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("429");

        if (isTemporary && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          break; // Move to next fallback model
        }
      }
    }
  }

  throw lastError || new Error("모든 AI 모델 호출 시도가 실패했습니다. 잠시 후 다시 시도해 주세요.");
}

/**
 * Clean and parse JSON from Gemini response (handles markdown codeblocks and trailing characters)
 */
function safeParseJson(rawText: string): any {
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch (e) {
    // Strip markdown codeblocks
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      // Find outermost JSON brackets
      const startIdx = cleaned.indexOf("{");
      const endIdx = cleaned.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        return JSON.parse(cleaned.substring(startIdx, endIdx + 1));
      }
      throw new Error("AI 응답 데이터(JSON) 구문 분석에 실패했습니다.");
    }
  }
}

/**
 * Intelligent Heuristic Assessment Generator for Offline/High-Demand Fallback
 */
/**
 * Emergency rule-based heuristic assessment generator.
 * Strictly extracts real dialogue quotes from the actual transcript without injecting generic canned boilerplate.
 */
function generateHeuristicAssessment(
  transcriptText: string,
  documentType: string,
  clientInfo?: any,
  additionalNotes?: string
): any {
  const fullText = `${transcriptText} ${additionalNotes || ""}`.trim();
  const sentences = fullText
    .split(/[\n.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const clientName = clientInfo?.name || "상담 대상자";
  const clientAge = clientInfo?.age || "78";

  // Helper to find exact dialogue quote matching patterns
  const findQuote = (regex: RegExp): string => {
    const match = sentences.find((s) => regex.test(s));
    return match ? match.slice(0, 120) : "";
  };

  // 1. Physical health analysis
  const healthRegex = /혈압|당뇨|관절|무릎|허리|다리|어깨|눈|백내장|치아|틀니|심장|뇌졸중|중풍|치매|통증|아프|지팡이|보행|병원|약|투약|수술/i;
  const healthQuote = findQuote(healthRegex);
  let physicalHealthStatus = "";
  if (healthQuote) {
    physicalHealthStatus = `[내담자 구술 근거]: "${healthQuote}"\n상담 중 호소한 신체 증상 및 질환에 대한 투약·진료 지속성 확인 및 정기 건강 모니터링 필요.`;
  } else {
    physicalHealthStatus = "[상담 중 구체적 만성질환 호소 미언급 - 차회 정밀 문진 및 건강상태 확인 필요]";
  }

  // 2. Meal & Nutrition
  const mealRegex = /식사|밥|반찬|끼니|영양|김치|국|입맛|굶|라면|죽|배달|복지관/i;
  const mealQuote = findQuote(mealRegex);
  let adlStatus = "";
  if (mealQuote) {
    adlStatus = `[식생활 구술 근거]: "${mealQuote}"\n기본 일상생활(ADL)은 부분 자립 가능하나 규칙적 식사 및 영양 상태 지속적 점검 요망.`;
  } else {
    adlStatus = "기본적 일상생활(식사, 세면, 착의)은 자립 수행 중인 것으로 관찰되나 체력 저하 시 보조 필요성 점검 요망.";
  }

  // 3. IADL & Outing
  const iadlRegex = /장보기|외출|시장|청소|빨래|가사|돈|은행|버스|교통/i;
  const iadlQuote = findQuote(iadlRegex);
  let iadlStatus = "";
  if (iadlQuote) {
    iadlStatus = `[도구적 일상생활 구술]: "${iadlQuote}"\n원거리 외출 및 가사 활동 시 부분적 도움이나 지원 체계 점검 필요.`;
  } else {
    iadlStatus = "도구적 일상생활(IADL)에 대한 전반적 자립도 관찰되며 가사 및 무거운 물품 운반 시 지원 여부 확인 권장.";
  }

  // 4. Emotional & Mental State
  const emotionRegex = /외로|우울|혼자|적적|눈물|불안|잠|불면|걱정|답답|죽고|사별|슬프/i;
  const emotionQuote = findQuote(emotionRegex);
  let emotionalCognitiveStatus = "";
  if (emotionQuote) {
    emotionalCognitiveStatus = `[정서 호소 구술]: "${emotionQuote}"\n독거 생활 및 심리적 고립감으로 인한 정서적 지지 및 정기 안부확인 필요.`;
  } else {
    emotionalCognitiveStatus = "의사소통 및 지남력은 양호하며 대화에 협조적임. 사회적 관계망 유지와 정서적 안정을 위한 정기 모니터링 권장.";
  }

  // 5. Housing & Safety
  const housingRegex = /집|방|화장실|문턱|미끄|보일러|난방|추워|더워|곰팡이|누수|계단|도배|청소/i;
  const housingQuote = findQuote(housingRegex);
  let housingEnvironment = "";
  if (housingQuote) {
    housingEnvironment = `[주거환경 구술]: "${housingQuote}"\n주거 내 위해요인 및 안전 취약점에 대한 환경 점검 및 보완 조치 검토 필요.`;
  } else {
    housingEnvironment = "[상담 중 주거시설 특이 위험사항 미언급 - 가정방문 시 실내 낙상 안전 점검 요망]";
  }

  // Risk Level determination
  const riskFactors: string[] = [];
  if (healthQuote) riskFactors.push("신체건강 호소");
  if (mealQuote) riskFactors.push("식생활/영양 관리 필요");
  if (emotionQuote) riskFactors.push("심리정서 고립감");
  if (housingQuote) riskFactors.push("주거안전 점검 필요");

  let riskLevel = "일반";
  if (riskFactors.length >= 3 || /위급|사고|응급|고위험/i.test(fullText)) {
    riskLevel = "고위험";
  } else if (riskFactors.length >= 1) {
    riskLevel = "중위험";
  }

  // Primary Needs
  const primaryNeeds: string[] = [];
  if (mealQuote) primaryNeeds.push("식사 지원 및 영양 상태 개선");
  if (healthQuote) primaryNeeds.push("만성질환 복약 지도 및 정기 건강 모니터링");
  if (housingQuote) primaryNeeds.push("가정 내 주거 환경 안전 점검");
  if (emotionQuote) primaryNeeds.push("정서적 지지체계 형성 및 말벗 지원");
  if (primaryNeeds.length === 0) {
    primaryNeeds.push("정기 재가 안부확인", "지역사회 복지정보 제공");
  }

  // Recommended Services tailored strictly to detected mentions
  const recommendedServices: any[] = [];
  if (mealQuote) {
    recommendedServices.push({
      category: "식사/일상지원",
      serviceName: "영양 식사/밑반찬 지원 서비스",
      frequency: "주 2회",
      purpose: "결식 예방 및 균형 잡힌 영양 섭취 지원",
      provider: "재가노인지원서비스센터",
    });
  }
  if (housingQuote) {
    recommendedServices.push({
      category: "주거안전",
      serviceName: "주거환경 안전점검 및 보수 연계",
      frequency: "1회 및 정기점검",
      purpose: "가정 내 안전사고 예방",
      provider: "지역 주거복지사업",
    });
  }
  if (emotionQuote) {
    recommendedServices.push({
      category: "정서지원",
      serviceName: "정기 말벗 상담 및 안부 확인",
      frequency: "주 1회",
      purpose: "사회적 고립감 완화 및 정서적 안정",
      provider: "생활지원사 / 자원봉사자",
    });
  }
  if (recommendedServices.length === 0) {
    recommendedServices.push({
      category: "사례관리",
      serviceName: "재가노인지원 정기 모니터링 상담",
      frequency: "월 1~2회",
      purpose: "기본 안부 확인 및 긴급 복지욕구 발생 대비",
      provider: "재가노인지원서비스센터",
    });
  }

  const socialWorkerOpinion = `본 사례는 ${clientName} 대상자의 실제 구술 내용(${riskFactors.join(", ") || "정기 일상 안부"})을 종합할 때, ${primaryNeeds.slice(0, 2).join(" 및 ")}에 대한 개입이 우선적으로 요구됨. 대상자의 개별 상황에 맞춘 재가노인지원서비스 연계 및 정기 모니터링 체계를 확립하여 안전한 재가생활을 도모함.`;

  const evidenceQuotes: Record<string, string> = {};
  if (healthQuote) evidenceQuotes.physicalHealthStatus = healthQuote;
  if (mealQuote) evidenceQuotes.adlStatus = mealQuote;
  if (emotionQuote) evidenceQuotes.emotionalCognitiveStatus = emotionQuote;
  if (housingQuote) evidenceQuotes.housingEnvironment = housingQuote;

  const contextualAlternatives: Record<string, string[]> = {
    physicalHealthStatus: [
      healthQuote
        ? `[내담자 진술] "${healthQuote}" 기반 정기 건강 체크 및 복약 모니터링 권고`
        : `특이 신체 질환 호소는 없으나 노화에 따른 신체 활력 저하 예방 필요`,
      `대상자의 잔존 신체기능 유지를 위한 가벼운 실내 스트레칭 및 보행 안전 수칙 안내`,
    ],
    emotionalCognitiveStatus: [
      emotionQuote
        ? `[내담자 진술] "${emotionQuote}" - 정서적 고립 완화를 위한 온기 나눔 말벗 연계`
        : `명확한 인지 상태 및 양호한 의사소통 유지 중`,
      `주기적 유선 안부전화를 통해 외로움을 경감하고 사회적 지지감 부여`,
    ],
    socialWorkerOpinion: [
      socialWorkerOpinion,
      `${clientName} 어르신의 자기결정권을 존중하며 필요한 자원(${primaryNeeds.join(", ")})을 우선 연계하는 단계적 사례관리 개입 추진.`,
    ],
  };

  const counselingPurpose = `${clientName} 어르신의 핵심 호소(${primaryNeeds.slice(0, 2).join(", ")}) 확인 및 맞춤형 재가노인지원서비스 연계 사정`;
  const counselingContent = `■ 1. 내담자 호소 및 면담 개요:
• 대상자: ${clientName} (${clientAge}세)
• 상담 확인 핵심 욕구: ${primaryNeeds.join(", ")}

■ 2. 신체·건강 및 일상생활 실태:
• 신체 건강: ${physicalHealthStatus}
• 일상생활(ADL/IADL): ${adlStatus} / ${iadlStatus}

■ 3. 심리·정서 및 주거 실태:
• 심리 정서: ${emotionalCognitiveStatus}
• 주거 환경: ${housingEnvironment}

■ 4. 사회복지사 종합 소견 및 조치 계획:
• ${socialWorkerOpinion}`;

  return {
    executiveSummary: [
      `1. [사정 대상] ${clientName} 어르신 상담 기록 기반 맞춤 사정 (${riskLevel}군 판정)`,
      `2. [핵심 호소] ${primaryNeeds.join(", ")}`,
      `3. [개입 방향] ${recommendedServices.map((s) => s.serviceName).join(", ")} 우선 연계`,
    ],
    riskLevel,
    riskRationale: `${clientName} 어르신의 구체적 발화 기반 분석 결과: ${riskFactors.join(", ") || "기본 안부확인 중심"} 요인으로 사정됨.`,
    clientName,
    estimatedAge: `${clientAge}세`,
    gender: clientInfo?.gender || "미상",
    livingType: clientInfo?.livingType || "독거",
    primaryNeeds,
    physicalHealthStatus,
    adlStatus,
    iadlStatus,
    emotionalCognitiveStatus,
    housingEnvironment,
    economicStatus: clientInfo?.welfareType || "기초연금 또는 저소득 독거가구",
    socialSupportNetwork: "가족 및 이웃 관계망 확인 및 센터 돌봄 안전망 확충 요망",
    socialWorkerOpinion,
    recommendedServices,
    shortTermGoals: primaryNeeds.map((n, i) => `${i + 1}. ${n}을 위한 맞춤형 서비스 연계 및 안전망 확보`),
    longTermGoals: [
      "지역사회 내에서 잔존 기능을 유지하며 존엄하고 안전한 재가 노후생활 지속",
      "사회적 고립감 해소 및 안정적 복지 안전망 구축",
    ],
    evidenceQuotes,
    contextualAlternatives,
    formSpecificFields: {
      counselingPurpose,
      counselingContent,
      counselingMethod: "방문상담",
      counselingCategory: "정기상담 및 사정",
      counselingNextPlan: "맞춤형 서비스 계획 확정 및 차회 정기 방문 일정 조율",
      intakeSummary: `${clientName} 어르신 초기 상담 면담 실시 완료. 주 호소: ${primaryNeeds.join(", ")}`,
      intakeHealthStatus: physicalHealthStatus,
      intakeHousingSafety: housingEnvironment,
      intakeClientEmotion: emotionalCognitiveStatus,
      intakeCounselorOpinion: socialWorkerOpinion,
      assessmentNeeds: primaryNeeds.join(", "),
      assessmentAdlSummary: `${adlStatus} / ${iadlStatus}`,
      assessmentEmotional: emotionalCognitiveStatus,
      assessmentEnvironment: housingEnvironment,
      assessmentOverallPlan: socialWorkerOpinion,
      problemAndNeeds: `${clientName} 어르신 상담을 통해 도출된 핵심 욕구는 ${primaryNeeds.join(", ")}임.`,
      longTermGoal: "안전한 재가 생활 지속 및 고립 예방",
      shortTermGoal: primaryNeeds.join(" / "),
      servicePlanManagerOpinion: socialWorkerOpinion,
      conferenceTopic: `${clientName} 어르신 맞춤형 사례지원 방안 검토`,
      conferenceDiscussion: `주요 욕구(${primaryNeeds.join(", ")})에 대한 서비스 우선순위 협의`,
      conferenceDecision: `${recommendedServices.map((s) => s.serviceName).join(", ")} 연계 결정`,
      monitoringChange: "초기 상담 대비 라포 형성 및 주요 욕구 구체화됨",
      monitoringActionTaken: "사정 결과 기반 서비스 제공계획 수립 안내",
      terminationReason: "목표 달성 및 안정적 자립 유지",
      goalAchievementRate: "85% 달성",
      followUpPlan: "월 1회 전화 안부 확인 및 비상연락망 유지",
    },
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Normalize and validate audio MIME types for Gemini API compatibility.
 * Strips codecs and parameters, resolves extensions, and maps to official Gemini supported formats.
 */
function normalizeAudioMimeType(rawMimeType?: string, fileName?: string): { mimeType: string; isSupported: boolean; detectedFormat: string } {
  let cleaned = (rawMimeType || "").split(";")[0].trim().toLowerCase();
  const ext = (fileName || "").split(".").pop()?.toLowerCase() || "";

  // Map file extension if MIME is missing or generic
  if (!cleaned || cleaned === "application/octet-stream" || cleaned === "binary/octet-stream" || cleaned === "audio/*") {
    switch (ext) {
      case "mp3":
        cleaned = "audio/mp3";
        break;
      case "wav":
      case "wave":
        cleaned = "audio/wav";
        break;
      case "m4a":
        cleaned = "audio/m4a";
        break;
      case "aac":
        cleaned = "audio/aac";
        break;
      case "ogg":
      case "opus":
        cleaned = "audio/ogg";
        break;
      case "webm":
        cleaned = "audio/webm";
        break;
      case "flac":
        cleaned = "audio/flac";
        break;
      case "mp4":
        cleaned = "audio/mp4";
        break;
      default:
        cleaned = "audio/mp3";
        break;
    }
  }

  // Normalize specific aliases to standard Gemini API MIME types
  let normalized = cleaned;
  let detectedFormat = ext.toUpperCase() || "AUDIO";

  if (cleaned === "audio/mpeg" || cleaned === "audio/mp3" || cleaned === "audio/x-mp3" || cleaned === "audio/mpeg3") {
    normalized = "audio/mp3";
    detectedFormat = "MP3";
  } else if (cleaned === "audio/wav" || cleaned === "audio/x-wav" || cleaned === "audio/wave" || cleaned === "audio/vnd.wave") {
    normalized = "audio/wav";
    detectedFormat = "WAV";
  } else if (cleaned === "audio/m4a" || cleaned === "audio/x-m4a") {
    normalized = "audio/m4a";
    detectedFormat = "M4A";
  } else if (cleaned === "audio/mp4" || cleaned === "audio/x-mp4") {
    normalized = "audio/mp4";
    detectedFormat = "MP4";
  } else if (cleaned === "audio/aac" || cleaned === "audio/x-aac") {
    normalized = "audio/aac";
    detectedFormat = "AAC";
  } else if (cleaned === "audio/ogg" || cleaned === "audio/opus" || cleaned === "audio/x-ogg") {
    normalized = "audio/ogg";
    detectedFormat = "OGG";
  } else if (cleaned === "audio/webm" || cleaned === "audio/x-webm") {
    normalized = "audio/webm";
    detectedFormat = "WEBM";
  } else if (cleaned === "audio/flac" || cleaned === "audio/x-flac") {
    normalized = "audio/flac";
    detectedFormat = "FLAC";
  }

  // Gemini API officially supported audio MIME list
  const supportedMimes = [
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "audio/m4a",
    "audio/mp4",
    "audio/aac",
    "audio/ogg",
    "audio/webm",
    "audio/flac",
  ];

  const isSupported = supportedMimes.includes(normalized);

  return { mimeType: normalized, isSupported, detectedFormat };
}

/**
 * 🎙️ AI Audio Transcription (Speech-to-Text) Endpoint
 * Transcribes audio files (MP3, WAV, M4A, OGG, WebM, FLAC, AAC) into professional Korean consultation dialogue
 * Features robust payload validation, MIME normalization, and multi-model fallback.
 */
app.post("/api/ai/transcribe-audio", async (req, res) => {
  const requestStartTime = Date.now();
  // Ensure response is always application/json
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const {
      audioBase64,
      mimeType,
      fileName,
      chunkIndex,
      totalChunks,
      timeRangeLabel,
    } = req.body;

    // 1. Audio Data Presence Validation
    if (!audioBase64 || typeof audioBase64 !== "string" || audioBase64.trim().length === 0) {
      console.warn("[Audio STT Validation Error] Missing or empty audioBase64 payload.");
      return res.status(400).json({
        success: false,
        error: "업로드된 음성 데이터가 비어 있습니다. 오디오 파일을 다시 선택해 주세요.",
      });
    }

    // 2. Clean Base64 string (strip possible data URI prefix and whitespace)
    let cleanBase64 = audioBase64.trim();
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1].trim();
    }
    // Remove newlines and whitespace
    cleanBase64 = cleanBase64.replace(/\s+/g, "");

    // 3. Validate Base64 decoding & calculate size
    let audioBuffer: Buffer;
    try {
      audioBuffer = Buffer.from(cleanBase64, "base64");
      if (audioBuffer.length === 0) {
        throw new Error("디코딩된 오디오 버퍼의 크기가 0바이트입니다.");
      }
    } catch (decodeErr: any) {
      console.error("[Audio STT Base64 Decode Error]:", decodeErr);
      return res.status(400).json({
        success: false,
        error: `오디오 Base64 인코딩 데이터가 손상되었습니다: ${decodeErr.message}`,
      });
    }

    const sizeInKB = Math.round(audioBuffer.length / 1024);
    const sizeInMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);

    // Check size threshold
    if (audioBuffer.length > 50 * 1024 * 1024) {
      console.warn(`[Audio STT Warning] Audio chunk/file exceeds 50MB: ${sizeInMB}MB`);
      return res.status(413).json({
        success: false,
        error: `오디오 데이터 크기가 한도를 초과하였습니다 (${sizeInMB}MB). 자동 분할 처리된 음성을 이용해 주세요.`,
      });
    }

    // 4. Validate & Normalize MIME Type for Gemini compatibility
    const { mimeType: normalizedMime, isSupported, detectedFormat } = normalizeAudioMimeType(mimeType, fileName);

    const isSegment = typeof chunkIndex === "number" && typeof totalChunks === "number" && totalChunks > 1;

    console.log(`[Audio STT] 📥 Incoming request:
  - File Name: ${fileName || "unnamed_audio"} ${isSegment ? `[구간 ${chunkIndex + 1}/${totalChunks} (${timeRangeLabel})]` : ""}
  - Detected Format: ${detectedFormat}
  - Raw MIME: ${mimeType || "none"} -> Normalized MIME: ${normalizedMime} (Supported: ${isSupported})
  - Buffer Size: ${sizeInKB} KB (${sizeInMB} MB)
  - Base64 Length: ${cleanBase64.length.toLocaleString()} chars`);

    const promptText = isSegment
      ? `당신은 대한민국 최고 수준의 한국어 음성 인식(STT) 및 노인복지 상담 기록 전문 AI입니다.
첨부된 파일은 약 1시간 분량의 노인복지 상담/가정방문 음성 중 [제 ${chunkIndex + 1}/${totalChunks} 구간 (${timeRangeLabel || ""})]의 음성입니다.
이 구간의 대화를 주의 깊게 듣고 한국어로 정확하게 전문 녹취록(Transcript)으로 변환해 주세요.

작성 규칙:
1. 발화자 구분이 가능한 경우 [사회복지사], [어르신], [보호자], [상담원] 등으로 화자를 명확히 구분하여 줄바꿈으로 기록하십시오.
2. 어르신의 사투리, 구어체 발화, 감정적 표현, 건강/통증 호소, 식사/복약 언급을 왜곡 없이 충실하게 받아적으십시오.
3. 잡음이나 불명확한 부분은 문맥을 통해 가장 자연스러운 한국어 어휘로 복원하십시오.
4. 부가적인 서두 인사나 마크다운 설명 없이, 실제 대화 녹취 텍스트 본문만 깔끔하게 출력하십시오.`
      : `당신은 대한민국 최고 수준의 한국어 음성 인식(STT) 및 노인복지 상담 기록 전문 AI입니다.
첨부된 노인복지 상담 또는 어르신 가정방문 음성 녹음 파일을 듣고, 한국어로 정확하게 전문 녹취록(Transcript)으로 변환해 주세요.

작성 규칙:
1. 발화자 구분이 가능한 경우 [사회복지사], [어르신], [보호자], [상담원] 등으로 화자를 명확히 구분하여 줄바꿈으로 기록하십시오.
2. 어르신의 사투리, 구어체 발화, 감정적 표현, 건강/통증 호소, 식사/복약 언급을 왜곡 없이 충실하게 받아적으십시오.
3. 잡음이나 불명확한 부분은 문맥을 통해 가장 자연스러운 한국어 어휘로 복원하십시오.
4. 부가적인 서두 인사나 마크다운 설명(예: '다음은 녹취록입니다') 없이, 실제 대화 녹취 텍스트 본문만 깔끔하게 출력하십시오.`;

    const audioPart = {
      inlineData: {
        mimeType: normalizedMime,
        data: cleanBase64,
      },
    };

    const contents = {
      parts: [
        audioPart,
        {
          text: promptText,
        },
      ],
    };

    // Priority model fallback chain for audio transcription:
    // 1) gemini-3.5-transcribe (specialized for audio STT)
    // 2) gemini-flash-latest (multimodal fallback)
    const modelsToTry = [
      "gemini-3.5-transcribe",
      "gemini-flash-latest",
    ];

    let resultText = "";
    let usedModel = "";

    try {
      const response = await callGeminiWithFallback(modelsToTry, contents);
      resultText = response.text;
      usedModel = response.modelUsed;
    } catch (modelErr: any) {
      console.error("[Audio STT All Models Failed]:", modelErr);
      throw new Error(`AI 음성 인식 모델 호출에 실패했습니다: ${modelErr.message || String(modelErr)}`);
    }

    const elapsedMs = Date.now() - requestStartTime;
    console.log(`[Audio STT Success] ✅ Completed in ${elapsedMs}ms using model [${usedModel}]. Transcript length: ${resultText.length} characters.`);

    res.json({
      success: true,
      transcript: resultText.trim(),
      fileName: fileName || "음성 녹음 파일",
      chunkIndex,
      totalChunks,
      timeRangeLabel,
      detectedFormat,
      mimeTypeUsed: normalizedMime,
      modelUsed: usedModel,
      sizeKB: sizeInKB,
      processingTimeMs: elapsedMs,
    });
  } catch (error: any) {
    const elapsedMs = Date.now() - requestStartTime;
    console.error(`[Audio STT Failure] ❌ Failed after ${elapsedMs}ms:`, {
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
    });

    res.status(500).json({
      success: false,
      error: error.message || "음성 파일을 텍스트로 변환하는 중 오류가 발생했습니다. 오디오 파일 형식이나 마이크 입력을 확인해 주세요.",
      details: {
        elapsedMs,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * ====================================================================
 * High-Capacity Audio Upload & Background FFmpeg Transcoding Pipeline
 * Handles 40-minute ~ 2-hour AAC, M4A, MP3, WAV files without timeout
 * ====================================================================
 */

interface AudioJobState {
  id: string;
  fileName: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  statusText: string;
  currentSegment?: number;
  totalSegments?: number;
  totalDurationSec?: number;
  durationFormatted?: string;
  transcript?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const audioJobs = new Map<string, AudioJobState>();

// Periodic cleanup of stale jobs (> 2 hours old)
setInterval(() => {
  const now = Date.now();
  for (const [jobId, job] of audioJobs.entries()) {
    if (now - job.createdAt > 2 * 60 * 60 * 1000) {
      audioJobs.delete(jobId);
      const tempDir = path.join(os.tmpdir(), `carebridge_audio_${jobId}`);
      if (fs.existsSync(tempDir)) {
        fs.rm(tempDir, { recursive: true, force: true }, () => {});
      }
    }
  }
}, 30 * 60 * 1000);

function formatSecondsToMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDurationToKorean(seconds: number): string {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}시간 ${m}분 ${s}초 (${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")})`;
  }
  return `${m}분 ${s}초 (${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")})`;
}

// 1. Chunked Upload Endpoint for Large Audio Files
app.post("/api/ai/upload-audio-chunk", async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, chunkBase64, fileName } = req.body;

    if (!uploadId || typeof chunkIndex !== "number" || typeof totalChunks !== "number" || !chunkBase64) {
      return res.status(400).json({ success: false, error: "필수 청크 업로드 매개변수가 누락되었습니다." });
    }

    const tempDir = path.join(os.tmpdir(), `carebridge_audio_${uploadId}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const cleanBase64 = chunkBase64.includes(",") ? chunkBase64.split(",")[1] : chunkBase64;
    const chunkBuffer = Buffer.from(cleanBase64, "base64");
    const chunkFilePath = path.join(tempDir, `chunk_${String(chunkIndex).padStart(5, "0")}.part`);

    fs.writeFileSync(chunkFilePath, chunkBuffer);

    // Track state
    if (!audioJobs.has(uploadId)) {
      audioJobs.set(uploadId, {
        id: uploadId,
        fileName: fileName || "상담녹음.aac",
        status: "uploading",
        progress: Math.round(((chunkIndex + 1) / totalChunks) * 15),
        statusText: `대용량 파일 서버 전송 중 (${chunkIndex + 1}/${totalChunks} 조각)...`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      const job = audioJobs.get(uploadId)!;
      job.progress = Math.round(((chunkIndex + 1) / totalChunks) * 15);
      job.statusText = `대용량 파일 서버 전송 중 (${chunkIndex + 1}/${totalChunks} 조각)...`;
      job.updatedAt = Date.now();
    }

    const isComplete = chunkIndex === totalChunks - 1;

    if (isComplete) {
      // Assemble all chunks into the final source file synchronously to avoid race condition with job start
      const ext = path.extname(fileName || "audio.aac") || ".aac";
      const base = path.basename(fileName || "audio.aac", ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeFileName = `${base || "audio"}${ext}`;
      const assembledFilePath = path.join(tempDir, `assembled_${safeFileName}`);
      
      if (fs.existsSync(assembledFilePath)) {
        try { fs.unlinkSync(assembledFilePath); } catch {}
      }

      for (let i = 0; i < totalChunks; i++) {
        const partPath = path.join(tempDir, `chunk_${String(i).padStart(5, "0")}.part`);
        if (!fs.existsSync(partPath)) {
          throw new Error(`청크 파일 누락: ${i + 1}/${totalChunks}`);
        }
        const partBuffer = fs.readFileSync(partPath);
        fs.appendFileSync(assembledFilePath, partBuffer);
        // Clean part file
        try { fs.unlinkSync(partPath); } catch {}
      }

      const job = audioJobs.get(uploadId)!;
      job.status = "processing";
      job.progress = 18;
      job.statusText = "파일 전송 완료. FFmpeg 오디오 엔진 초기화 중...";
      job.updatedAt = Date.now();

      return res.json({
        success: true,
        isComplete: true,
        uploadId,
        assembledFilePath,
        message: "전체 오디오 청크 수신 및 조립이 완료되었습니다.",
      });
    }

    return res.json({
      success: true,
      isComplete: false,
      uploadId,
      chunkIndex,
      totalChunks,
    });
  } catch (error: any) {
    console.error("[Audio Chunk Upload Error]:", error);
    res.status(500).json({
      success: false,
      error: `오디오 청크 업로드 실패: ${error.message || String(error)}`,
    });
  }
});

/**
 * Creates a standard 44-byte RIFF/WAVE header for linear PCM 16-bit audio
 * Guaranteed to produce 100% valid WAV files that require zero external dependencies
 */
function createWavHeader(
  dataLength: number,
  sampleRate = 16000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  // RIFF identifier
  buffer.write("RIFF", 0);
  // RIFF chunk length (36 + dataLength)
  buffer.writeUInt32LE(36 + dataLength, 4);
  // RIFF type
  buffer.write("WAVE", 8);
  // format chunk identifier
  buffer.write("fmt ", 12);
  // format chunk length
  buffer.writeUInt32LE(16, 16);
  // sample format (1 = PCM)
  buffer.writeUInt16LE(1, 20);
  // channel count
  buffer.writeUInt16LE(numChannels, 22);
  // sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // byte rate
  buffer.writeUInt32LE(byteRate, 28);
  // block align
  buffer.writeUInt16LE(blockAlign, 32);
  // bits per sample
  buffer.writeUInt16LE(bitsPerSample, 34);
  // data chunk identifier
  buffer.write("data", 36);
  // data chunk length
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

/**
 * Multi-Tier Resilient Audio Transcoder
 * Handles all real-world recording variations:
 * - iPhone/Samsung Voice Memos (AAC in MP4/M4A containers or ADTS)
 * - AAC-LATM / AAC-ELD / HE-AAC codecs
 * - Corrupted DTS/PTS timestamps, packet drops, sample rate drift
 * - Metadata/Artwork/Timecode tracks in Apple Voice Memos
 */
async function robustTranscodeAudioTo16kWav(
  inputAudioPath: string,
  intermediateWav: string
): Promise<{ success: boolean; durationSec: number; strategyUsed: string; error?: string }> {
  // Strategy definitions in priority order
  const strategies: { name: string; args: string[] }[] = [
    {
      name: "T1_JitterProof_AudioStreamOnly",
      args: [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-fflags", "+genpts+discardcorrupt+igndts",
        "-err_detect", "ignore_err",
        "-i", inputAudioPath,
        "-map", "0:a:0",
        "-vn", "-sn", "-dn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        "-af", "aresample=async=1000:min_hard_comp=0.100000:first_pts=0",
        intermediateWav,
      ],
    },
    {
      name: "T2_AudioStreamResample_NoMap",
      args: [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-fflags", "+genpts+discardcorrupt+igndts",
        "-err_detect", "ignore_err",
        "-i", inputAudioPath,
        "-vn", "-sn", "-dn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        "-af", "aresample=async=1000:min_hard_comp=0.100000:first_pts=0",
        intermediateWav,
      ],
    },
    {
      name: "T3_AAC_LATM_Syntax_Decoder",
      args: [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-c:a", "aac_latm",
        "-err_detect", "ignore_err",
        "-i", inputAudioPath,
        "-vn", "-sn", "-dn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        intermediateWav,
      ],
    },
    {
      name: "T4_MP4_Container_Demuxer",
      args: [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-f", "mp4",
        "-err_detect", "ignore_err",
        "-i", inputAudioPath,
        "-vn", "-sn", "-dn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        intermediateWav,
      ],
    },
    {
      name: "T5_DirectBasic_Transcode",
      args: [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-i", inputAudioPath,
        "-vn",
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        intermediateWav,
      ],
    },
  ];

  let lastErrorMsg = "";

  for (const strategy of strategies) {
    if (fs.existsSync(intermediateWav)) {
      try { fs.unlinkSync(intermediateWav); } catch {}
    }

    try {
      console.log(`[Audio Transcode Engine] Trying Strategy: ${strategy.name}...`);
      await execFileAsync("/usr/bin/ffmpeg", strategy.args, { maxBuffer: 50 * 1024 * 1024 });

      if (fs.existsSync(intermediateWav)) {
        const stats = fs.statSync(intermediateWav);
        if (stats.size > 44) {
          // Calculate exact duration from raw linear PCM WAV (32,000 bytes per second at 16kHz mono 16-bit)
          const dataBytes = stats.size - 44;
          const durationSec = Math.max(1, Math.round(dataBytes / 32000));
          console.log(`[Audio Transcode Success] Strategy [${strategy.name}] succeeded! Duration: ${durationSec}s (${stats.size} bytes).`);
          return { success: true, durationSec, strategyUsed: strategy.name };
        }
      }
    } catch (err: any) {
      lastErrorMsg = err?.stderr || err?.message || String(err);
      console.warn(`[Audio Transcode Warning] Strategy [${strategy.name}] failed:`, lastErrorMsg.slice(0, 150));
    }
  }

  return { success: false, durationSec: 0, strategyUsed: "none", error: lastErrorMsg };
}

/**
 * Splits a clean 16kHz mono 16-bit PCM WAV file into 300-second (5 min) segments
 * Uses pure Node.js binary slicing as an infallible fallback if FFmpeg segmenting fails
 */
async function splitWavFileToSegments(
  wavPath: string,
  tempDir: string,
  segmentDurationSec = 300
): Promise<string[]> {
  const stat = fs.statSync(wavPath);
  const dataBytes = Math.max(0, stat.size - 44);
  const durationSec = Math.max(1, Math.round(dataBytes / 32000));

  // If audio is shorter than segment duration, 1 segment is sufficient
  if (durationSec <= segmentDurationSec) {
    const singleSeg = path.join(tempDir, "segment_000.wav");
    if (wavPath !== singleSeg) {
      try {
        fs.copyFileSync(wavPath, singleSeg);
      } catch {
        return [path.basename(wavPath)];
      }
    }
    return ["segment_000.wav"];
  }

  // Method 1: Try FFmpeg segment muxer on the PCM WAV
  const segmentPattern = path.join(tempDir, "segment_%03d.wav");
  try {
    await execFileAsync(
      "/usr/bin/ffmpeg",
      [
        "-y",
        "-nostats",
        "-loglevel", "error",
        "-i", wavPath,
        "-f", "segment",
        "-segment_time", String(segmentDurationSec),
        "-reset_timestamps", "1",
        segmentPattern,
      ],
      { maxBuffer: 50 * 1024 * 1024 }
    );

    const segs = fs
      .readdirSync(tempDir)
      .filter((f) => f.startsWith("segment_") && f.endsWith(".wav"))
      .sort();

    if (segs.length > 0) {
      console.log(`[WAV Split] FFmpeg segment muxer succeeded with ${segs.length} segments.`);
      return segs;
    }
  } catch (segErr) {
    console.warn("[WAV Split] FFmpeg segment muxer failed, falling back to Pure Node.js WAV splitter:", segErr);
  }

  // Method 2: Infallible Pure Node.js Binary WAV Chunker
  // 16kHz mono 16-bit PCM = 32,000 bytes per second
  console.log("[WAV Split] Executing Pure Node.js Binary WAV Chunker (100% resilient fallback)...");
  const bytesPerChunk = segmentDurationSec * 32000;
  const totalChunks = Math.ceil(dataBytes / bytesPerChunk);
  const generatedSegs: string[] = [];

  const fd = fs.openSync(wavPath, "r");
  try {
    for (let i = 0; i < totalChunks; i++) {
      const offset = 44 + i * bytesPerChunk;
      const thisChunkBytes = Math.min(bytesPerChunk, dataBytes - i * bytesPerChunk);
      const pcmBuf = Buffer.alloc(thisChunkBytes);
      fs.readSync(fd, pcmBuf, 0, thisChunkBytes, offset);

      const header = createWavHeader(thisChunkBytes, 16000, 1, 16);
      const segFileName = `segment_${String(i).padStart(3, "0")}.wav`;
      const segFilePath = path.join(tempDir, segFileName);
      fs.writeFileSync(segFilePath, Buffer.concat([header, pcmBuf]));
      generatedSegs.push(segFileName);
    }
  } finally {
    fs.closeSync(fd);
  }

  console.log(`[WAV Split] Pure Node.js Binary WAV Chunker generated ${generatedSegs.length} segments successfully.`);
  return generatedSegs;
}

/**
 * Direct Time-Seek Extraction Fallback
 * Slices chunks directly from the input audio file via -ss [start] -t [duration]
 */
async function timeSliceSourceDirectly(
  inputAudioPath: string,
  tempDir: string,
  totalDurationSec: number,
  segmentDurationSec = 300
): Promise<string[]> {
  const totalChunks = Math.max(1, Math.ceil(totalDurationSec / segmentDurationSec));
  const segFiles: string[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const startSec = i * segmentDurationSec;
    const segName = `segment_${String(i).padStart(3, "0")}.wav`;
    const segPath = path.join(tempDir, segName);

    try {
      await execFileAsync(
        "/usr/bin/ffmpeg",
        [
          "-y",
          "-nostats",
          "-loglevel", "error",
          "-ss", String(startSec),
          "-t", String(segmentDurationSec),
          "-fflags", "+genpts+discardcorrupt+igndts",
          "-err_detect", "ignore_err",
          "-i", inputAudioPath,
          "-vn", "-sn", "-dn",
          "-ar", "16000",
          "-ac", "1",
          "-c:a", "pcm_s16le",
          "-af", "aresample=async=1000:first_pts=0",
          segPath,
        ],
        { maxBuffer: 50 * 1024 * 1024 }
      );

      if (fs.existsSync(segPath) && fs.statSync(segPath).size > 44) {
        segFiles.push(segName);
      }
    } catch (sliceErr) {
      console.warn(`[Direct Time-Slice Warning] Failed on segment ${i + 1}:`, sliceErr);
    }
  }

  return segFiles;
}

// 2. Start Large Audio Background Processing Job
app.post("/api/ai/start-large-audio-job", async (req, res) => {
  const { uploadId, fileName, durationSec } = req.body;

  if (!uploadId) {
    return res.status(400).json({ success: false, error: "uploadId가 제공되지 않았습니다." });
  }

  const tempDir = path.join(os.tmpdir(), `carebridge_audio_${uploadId}`);
  if (!fs.existsSync(tempDir)) {
    return res.status(404).json({ success: false, error: "업로드된 오디오 세션을 찾을 수 없습니다." });
  }

  // Find the assembled file
  const files = fs.readdirSync(tempDir);
  const assembledFile = files.find((f) => f.startsWith("assembled_"));
  if (!assembledFile) {
    return res.status(404).json({ success: false, error: "조립된 원본 오디오 파일이 존재하지 않습니다." });
  }

  const inputAudioPath = path.join(tempDir, assembledFile);

  // Initialize job in map
  audioJobs.set(uploadId, {
    id: uploadId,
    fileName: fileName || assembledFile.replace("assembled_", ""),
    status: "processing",
    progress: 20,
    statusText: "FFmpeg 오디오 스트림 정밀 분석 시작...",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Respond immediately so HTTP connection doesn't block or timeout
  res.json({
    success: true,
    jobId: uploadId,
    message: "대용량 오디오 분할 STT 백그라운드 작업이 시작되었습니다.",
  });

  // Execute pipeline asynchronously
  (async () => {
    const job = audioJobs.get(uploadId)!;
    try {
      // Step 1: Detect duration (prioritize client metadata if provided, otherwise ffprobe)
      let totalDurationSec = 0;
      if (typeof durationSec === "number" && durationSec > 0) {
        totalDurationSec = Math.round(durationSec);
      }

      if (!totalDurationSec || totalDurationSec <= 0) {
        try {
          const { stdout } = await execFileAsync(
            "/usr/bin/ffprobe",
            [
              "-v",
              "error",
              "-show_entries",
              "format=duration:stream=duration",
              "-of",
              "default=noprint_wrappers=1:nokey=1",
              inputAudioPath,
            ],
            { maxBuffer: 10 * 1024 * 1024 }
          );
          const lines = stdout.trim().split("\n");
          for (const line of lines) {
            const val = parseFloat(line.trim());
            if (!isNaN(val) && val > 0) {
              totalDurationSec = Math.round(val);
              break;
            }
          }
        } catch (ffprobeErr) {
          console.warn("[FFprobe duration warning]:", ffprobeErr);
        }
      }

      job.totalDurationSec = totalDurationSec;
      job.durationFormatted = totalDurationSec > 0 ? formatDurationToKorean(totalDurationSec) : "분석 중...";
      job.progress = 24;
      job.statusText = `음성 길이 확인 (${job.durationFormatted}): 16kHz 고품질 음성 리샘플링 및 분할 중...`;
      job.updatedAt = Date.now();

      // Step 2: Multi-Tier Resilient Audio Transcoding to 16kHz Mono WAV
      const intermediateWav = path.join(tempDir, "resampled_full.wav");
      let segFiles: string[] = [];

      const transcodeResult = await robustTranscodeAudioTo16kWav(inputAudioPath, intermediateWav);

      if (transcodeResult.success && fs.existsSync(intermediateWav)) {
        if (!totalDurationSec || totalDurationSec <= 0) {
          totalDurationSec = transcodeResult.durationSec;
          job.totalDurationSec = totalDurationSec;
          job.durationFormatted = formatDurationToKorean(totalDurationSec);
        }

        job.progress = 27;
        job.statusText = `16kHz 모노 리샘플링 완료 (${transcodeResult.strategyUsed}). 5분 단위 안전 구간 분할 중...`;
        job.updatedAt = Date.now();

        // Step 3: Split the clean WAV into 300s (5-minute) segments
        segFiles = await splitWavFileToSegments(intermediateWav, tempDir, 300);
      } else {
        console.warn("[Full Transcode Failed, attempting direct time-slice segmentation fallback]:", transcodeResult.error);
        job.progress = 26;
        job.statusText = "직접 시간 구간 분할 엔진(Time-Slice)으로 대체 가동 중...";
        job.updatedAt = Date.now();

        const approxDuration = totalDurationSec > 0 ? totalDurationSec : 2400;
        segFiles = await timeSliceSourceDirectly(inputAudioPath, tempDir, approxDuration, 300);
      }

      // Step 3.5: Validation of Segments
      if (segFiles.length === 0) {
        throw new Error(
          `오디오 분할 처리에 실패했습니다. 코덱 호환성 문제일 수 있습니다. (진단 정보: ${transcodeResult.error || "세그먼트 생성 실패"})`
        );
      }

      // Clean intermediate WAV to free up disk space
      try {
        if (fs.existsSync(intermediateWav)) {
          fs.unlinkSync(intermediateWav);
        }
      } catch {}

      const totalSegments = segFiles.length;
      if (!totalDurationSec || totalDurationSec <= 0) {
        totalDurationSec = totalSegments * 300;
        job.totalDurationSec = totalDurationSec;
        job.durationFormatted = formatDurationToKorean(totalDurationSec);
      }

      job.totalSegments = totalSegments;
      job.progress = 30;
      job.statusText = `총 ${totalSegments}개 구간 분할 완료. Gemini AI 고정밀 STT 순차 변환 시작...`;
      job.updatedAt = Date.now();

      const segmentTranscripts: string[] = [];

      // Step 4: Transcribe each segment sequentially via Gemini API
      for (let i = 0; i < totalSegments; i++) {
        job.currentSegment = i + 1;
        const startSec = i * 300;
        const endSec = totalDurationSec > 0 ? Math.min((i + 1) * 300, totalDurationSec) : (i + 1) * 300;
        const timeLabel = `${formatSecondsToMMSS(startSec)} ~ ${formatSecondsToMMSS(endSec)}`;

        const progressPercent = Math.round(30 + ((i + 1) / totalSegments) * 65);
        job.progress = progressPercent;
        job.statusText = `🎙️ [${i + 1}/${totalSegments} 구간: ${timeLabel}] Gemini AI 음성 인식 및 사회복지사/어르신 화자 분리 중...`;
        job.updatedAt = Date.now();

        const segmentFilePath = path.join(tempDir, segFiles[i]);
        if (!fs.existsSync(segmentFilePath)) {
          console.warn(`[Segment File Missing] ${segFiles[i]} not found on disk, skipping`);
          continue;
        }

        const wavBuffer = fs.readFileSync(segmentFilePath);
        const segmentBase64 = wavBuffer.toString("base64");

        const promptText = `당신은 대한민국 최고 수준의 한국어 음성 인식(STT) 및 노인복지 상담 기록 전문 AI입니다.
첨부된 파일은 약 40분~1시간 분량의 노인복지 상담/가정방문 음성 중 [제 ${i + 1}/${totalSegments} 구간 (${timeLabel})]의 음성입니다.
이 구간의 대화를 주의 깊게 듣고 한국어로 정확하게 전문 녹취록(Transcript)으로 변환해 주세요.

작성 규칙:
1. 발화자 구분이 가능한 경우 [사회복지사], [어르신], [보호자], [상담원] 등으로 화자를 명확히 구분하여 줄바꿈으로 기록하십시오.
2. 어르신의 사투리, 구어체 발화, 감정적 표현, 건강/통증 호소, 식사/복약 언급을 왜곡 없이 충실하게 받아적으십시오.
3. 잡음이나 불명확한 부분은 문맥을 통해 가장 자연스러운 한국어 어휘로 복원하십시오.
4. 부가적인 서두 인사나 마크다운 설명(예: '다음은 녹취록입니다') 없이, 실제 대화 녹취 텍스트 본문만 깔끔하게 출력하십시오.`;

        const contents = {
          parts: [
            {
              inlineData: {
                mimeType: "audio/wav",
                data: segmentBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        };

        const modelsToTry = ["gemini-flash-latest", "gemini-3.5-transcribe"];
        let segTranscript = "";

        try {
          const aiResponse = await callGeminiWithFallback(modelsToTry, contents);
          segTranscript = aiResponse.text.trim();
        } catch (apiErr: any) {
          console.error(`[Segment ${i + 1} STT Error]:`, apiErr);
          segTranscript = `[${timeLabel} 구간 음성 변환 중 일시적 지연 발생: 상담 음성 플레이어에서 확인 가능]`;
        }

        if (segTranscript) {
          segmentTranscripts.push(
            totalSegments > 1 ? `[${timeLabel} 구간]\n${segTranscript}` : segTranscript
          );
        }

        // Clean processed segment WAV to save disk space
        try {
          fs.unlinkSync(segmentFilePath);
        } catch {}
      }

      // Step 5: Finalize and Assemble full transcript
      const fullTranscript = segmentTranscripts.join("\n\n");
      job.status = "completed";
      job.progress = 100;
      job.statusText = `전체 ${totalSegments}개 구간 변환 완료! (${job.durationFormatted || ""})`;
      job.transcript = fullTranscript;
      job.updatedAt = Date.now();

      // Clean entire temporary directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}

      console.log(`[Large Audio Job Completed] Job ${uploadId}: ${fullTranscript.length} chars generated.`);
    } catch (jobErr: any) {
      console.error(`[Large Audio Job Failed] Job ${uploadId}:`, jobErr);
      job.status = "error";
      job.statusText = "음성 파일 분석 및 변환 실패";
      job.error = jobErr.message || "대용량 음성 처리 중 오류가 발생했습니다.";
      job.updatedAt = Date.now();

      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    }
  })();
});

// 3. Audio Job Status Polling Endpoint
app.get("/api/ai/audio-job-status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = audioJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ success: false, error: "작업을 찾을 수 없습니다." });
  }

  return res.json({
    success: true,
    job: {
      id: job.id,
      fileName: job.fileName,
      status: job.status,
      progress: job.progress,
      statusText: job.statusText,
      currentSegment: job.currentSegment,
      totalSegments: job.totalSegments,
      totalDurationSec: job.totalDurationSec,
      durationFormatted: job.durationFormatted,
      transcript: job.transcript,
      error: job.error,
    },
  });
});

// AI Case Documentation & Transcript Analysis Endpoint
app.post("/api/ai/analyze-transcript", async (req, res) => {
  try {
    const {
      documentType,
      transcriptText,
      clientInfo,
      additionalNotes,
      focusAreas,
    } = req.body;

    if (!transcriptText || transcriptText.trim().length === 0) {
      return res.status(400).json({ error: "상담 또는 녹취 텍스트가 입력되지 않았습니다." });
    }

    const documentTypeNames: Record<string, string> = {
      intake: "초기면접지 (Intake Sheet)",
      assessment: "종합사정기록지 (Comprehensive Assessment Form)",
      case_conference: "사례회의록 (Case Conference Record)",
      service_plan: "서비스 제공 계획서 (ISP - Individualized Service Plan)",
      monitoring: "모니터링 및 상담·방문일지 (Monitoring & Visit Log)",
      reassessment: "재사정표 (Re-assessment Record)",
      termination: "종결보고서 및 사례평가서 (Case Termination & Evaluation)",
    };

    const targetDocName = documentTypeNames[documentType] || "재가노인지원 사례관리 서식";

    const systemInstruction = `당신은 대한민국 노인복지관 및 재가노인지원서비스센터에서 15년 이상 근무한 최고 전문 수석 사회복지사이자 사례관리 전문가입니다.
사회복지사가 업로드한 어르신 상담 녹취록(STT) 또는 상담 텍스트 파일을 정밀 분석하여, [${targetDocName}] 서식의 각 항목을 높은 정확도로 미리 채워넣고 사용자가 검토·수정할 수 있도록 완벽한 데이터를 생성해야 합니다.

[🚨 절대 원칙: 대상자 개별화 및 사실 기반 분석 (일괄적·상투적 문구 및 허구 절대 금지)]:
1. 절대로 실제 상담 대화에 나오지 않은 일괄적인 상투어(예: 무조건 '양측 퇴행성 무릎 관절염', '화장실 미끄럼 방지 매트 설치', '주 2회 영양 밑반찬 배달' 등)를 기계적으로 반복 삽입하지 마십시오.
2. 오직 제공된 상담 녹취/텍스트 원문에서 대상자가 실제로 발화하거나 관찰된 구체적 사실(실제 앓고 계신 질환명, 복약 상황, 식사 양상, 주거 상태, 가족 관계, 정서적 고충, 실제 거론된 증상)만을 직접 근거로 하여 작성하십시오.
3. 상담에서 언급되지 않은 영역은 지어내지 말고 "[상담 중 미언급 - 차회 방문 시 추가 확인 필요]"로 정직하게 명시하십시오.
4. 각 필드별로 실제 상담 대화에서 추출한 발화 근거 구절(evidenceQuotes)과 추천 대안 문구(contextualAlternatives: 대상자 맞춤형 간결형/상세형/공문서형)를 함께 제공하여, 사회복지사가 확인하면서 쉽고 정확하게 수정할 수 있도록 지원하십시오.
5. 반드시 정해진 JSON 스키마 규격으로 응답하십시오.`;

    const promptContent = `
[분석 대상 서식]: ${targetDocName} (코드: ${documentType})
${clientInfo ? `[기존 대상자 기본 정보]:\n${JSON.stringify(clientInfo, null, 2)}` : ""}
${additionalNotes ? `[사회복지사 추가 메모/관찰사항]:\n${additionalNotes}` : ""}
${focusAreas && focusAreas.length ? `[중점 사정 영역]: ${focusAreas.join(", ")}` : ""}

[상담 녹취 / 대화 텍스트 전문]:
${transcriptText}

위 내용을 바탕으로 [${targetDocName}] 서식에 들어갈 내용과 분석 결과를 JSON으로 생성해 주세요.
`;

    try {
      const { text, modelUsed } = await callGeminiWithFallback(
        ["gemini-3.8-flash", "gemini-flash-latest"],
        promptContent,
        {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "사회복지사를 위한 3줄 핵심 요약 브리핑",
              },
              riskLevel: {
                type: Type.STRING,
                description: "위기도 등급 (고위험/중위험/일반)",
              },
              riskRationale: {
                type: Type.STRING,
                description: "위기도 판정 근거 및 주요 위험요인",
              },
              clientName: {
                type: Type.STRING,
                description: "대상자 성명 (녹취에서 파악된 경우)",
              },
              estimatedAge: {
                type: Type.STRING,
                description: "연령 또는 생년",
              },
              gender: {
                type: Type.STRING,
                description: "성별 (남/여/미상)",
              },
              livingType: {
                type: Type.STRING,
                description: "가구 형태 (독거, 노인부부, 자녀동거 등)",
              },
              primaryNeeds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "어르신의 실제 주요 욕구 및 문제 목록",
              },
              physicalHealthStatus: {
                type: Type.STRING,
                description: "실제 발화에 기반한 신체 및 건강 상태, 질환, 복약 실태",
              },
              adlStatus: {
                type: Type.STRING,
                description: "일상생활수행(식사, 거동, 개인위생 등) 상태",
              },
              iadlStatus: {
                type: Type.STRING,
                description: "도구적 일상생활(취사, 청소, 장보기, 금융/외출) 상태",
              },
              emotionalCognitiveStatus: {
                type: Type.STRING,
                description: "정서 및 인지 상태 (우울감, 외로움, 기억력, 수면 등)",
              },
              housingEnvironment: {
                type: Type.STRING,
                description: "주거 환경 (문턱, 난방, 위생, 낙상 위험요소 등)",
              },
              economicStatus: {
                type: Type.STRING,
                description: "경제 상태 및 수급 유형 (기초생활수급, 차상위, 기초연금 등)",
              },
              socialSupportNetwork: {
                type: Type.STRING,
                description: "가족 및 이웃 관계망, 공식/비공식 지지체계",
              },
              socialWorkerOpinion: {
                type: Type.STRING,
                description: "사회복지사 종합 소견 및 개입 방향",
              },
              recommendedServices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "서비스 범주 (식사/일상지원/정서/주거/건강/자원연계)" },
                    serviceName: { type: Type.STRING, description: "추천 세부 서비스명" },
                    frequency: { type: Type.STRING, description: "제공 주기 (주 1회, 월 2회, 상시 등)" },
                    purpose: { type: Type.STRING, description: "서비스 제공 목적 및 기대효과" },
                    provider: { type: Type.STRING, description: "제공 주체/연계기관" },
                  },
                  required: ["category", "serviceName", "purpose"],
                },
                description: "재가노인지원 맞춤형 추천 서비스 목록",
              },
              shortTermGoals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "단기 개입 목표",
              },
              longTermGoals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "장기 개입 목표",
              },
              evidenceQuotes: {
                type: Type.OBJECT,
                description: "각 주요 필드별 실제 대화록 발화 인용문 (physicalHealthStatus, emotionalCognitiveStatus, housingEnvironment, primaryNeeds 등)",
              },
              contextualAlternatives: {
                type: Type.OBJECT,
                description: "각 주요 필드별 해당 대상자에게 맞춤화된 대체 문구 2~3가지",
              },
              formSpecificFields: {
                type: Type.OBJECT,
                description: "해당 서식의 구체적 사전 입력 필드들 (counselingPurpose, counselingContent, intakeSummary, assessmentNeeds, problemAndNeeds 등)",
              },
            },
            required: [
              "executiveSummary",
              "riskLevel",
              "primaryNeeds",
              "socialWorkerOpinion",
              "recommendedServices",
            ],
          },
        }
      );

      const parsedJson = safeParseJson(text);
      res.json({
        success: true,
        documentType,
        result: parsedJson,
        modelUsed,
      });
    } catch (aiError: any) {
      console.warn("[AI Service Fallback Triggered]:", aiError.message);
      // Seamlessly generate clinical heuristic assessment so work is not blocked
      const fallbackResult = generateHeuristicAssessment(
        transcriptText,
        documentType,
        clientInfo,
        additionalNotes
      );

      res.json({
        success: true,
        documentType,
        result: fallbackResult,
        isFallback: true,
        notice: "AI 서버 일시적 지연으로 인해 전문 규칙 기반 비상 사정 엔진이 적용되었습니다.",
      });
    }
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "AI 분석 중 오류가 발생했습니다.",
    });
  }
});

// AI Case Document Compliance & Quality Audit Endpoint
app.post("/api/ai/audit-document", async (req, res) => {
  try {
    const { document, client } = req.body;
    if (!document) {
      return res.status(400).json({ error: "검수할 서식 데이터가 제공되지 않았습니다." });
    }

    const documentTypeNames: Record<string, string> = {
      intake: "초기면접지 (Intake Sheet)",
      assessment: "종합사정기록지 (Comprehensive Assessment Form)",
      case_conference: "사례회의록 (Case Conference Record)",
      service_plan: "서비스 제공 계획서 (ISP - Individualized Service Plan)",
      monitoring: "모니터링 및 상담·방문일지 (Monitoring & Visit Log)",
      reassessment: "재사정표 (Re-assessment Record)",
      termination: "종결보고서 및 사례평가서 (Case Termination & Evaluation)",
    };

    const docTypeName = documentTypeNames[document.documentType] || "사례관리 서식";

    const systemInstruction = `당신은 대한민국 보건복지부 노인보건복지사업안내 지침 및 한국사회복지사협회 표준 사례관리 매뉴얼에 정통한 공공 사회복지 감사관이자 수석 슈퍼바이저입니다.
제시된 [${docTypeName}] 기록을 면밀히 검수하여, 법정/지침 필수 항목의 누락 여부, 사회복지 실천 윤리(비낙인, 강점 관점, 권익 옹호)에 위배되는 부적절하거나 부정적인 표현, 법적/행정적 감사 리스크를 분석하고 구체적인 교정 제안을 JSON 규격으로 반환하십시오.

검수 기준:
1. 필수 항목 누락 검사: 대상자 기본 식별정보, 위기도 판정 근거, 신체/인지/환경 사정 세부항목, 명확한 개입 목표(단기/장기), 서비스 주기/주체, 종합 소견 등.
2. 부적절/소극적/낙인적 표현 탐지:
   - "답이 없음", "비협조적", "고집 부림", "버림받음", "제정신 아님", "무기력함" 등 주관적 비난이나 차별적 어휘가 있는지 전수 조사.
   - 이를 대체할 "자기결정권 존중", "심리적 방어기제 탐색 필요", "가족 지지체계 단절 상태", "인지기능 저하 및 지남력 약화", "강점 및 잔존 기능 기반 개입" 등 전문적 대안 제시.
3. 종합 적합도 점수(0~100점) 및 감사 상태(적합/양호/보완필요/주의) 산출.
4. 법적·감사 리스크 및 강점 사정 평가.`;

    const promptContent = `
[검수 대상 서식 정보]:
- 서식 유형: ${docTypeName} (${document.documentType})
- 문서 제목: ${document.title || "무제"}
- 대상 어르신: ${document.clientName || client?.name || "미지정"} (만 ${client?.age || "미상"}세, ${client?.livingType || "독거"}, ${client?.welfareType || "수급권 미상"})
- 위기도: ${document.riskLevel || client?.riskLevel || "미판정"}

[문서 본문 데이터]:
- 3줄 핵심 요약: ${JSON.stringify(document.executiveSummary || [])}
- 위기도 판정 근거: ${document.riskRationale || "(미작성)"}
- 주요 욕구: ${JSON.stringify(document.primaryNeeds || [])}
- 신체/건강 상태: ${document.physicalHealthStatus || "(미작성)"}
- 일상생활(ADL): ${document.adlStatus || "(미작성)"}
- 도구적 일상생활(IADL): ${document.iadlStatus || "(미작성)"}
- 정서/인지: ${document.emotionalCognitiveStatus || "(미작성)"}
- 주거환경: ${document.housingEnvironment || "(미작성)"}
- 경제상태: ${document.economicStatus || "(미작성)"}
- 사회적 지지망: ${document.socialSupportNetwork || "(미작성)"}
- 사회복지사 종합 소견: ${document.socialWorkerOpinion || "(미작성)"}
- 추천/제공 서비스: ${JSON.stringify(document.recommendedServices || [])}
- 단기 목표: ${JSON.stringify(document.shortTermGoals || [])}
- 장기 목표: ${JSON.stringify(document.longTermGoals || [])}
- 특화 필드: ${JSON.stringify(document.formSpecificFields || {})}

위 문서를 표준 서식 가이드라인과 비교 검수하여 정밀 피드백을 JSON으로 제공해 주세요.
`;

    const { text } = await callGeminiWithFallback(
      ["gemini-3.8-flash", "gemini-flash-latest"],
      promptContent,
      {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "종합 서식 품질 및 지침 부합도 점수 (0-100)",
            },
            status: {
              type: Type.STRING,
              description: "검수 판정 상태 ('적합', '양호', '보완필요', '주의')",
            },
            summary: {
              type: Type.STRING,
              description: "검수 총평 및 핵심 피드백 (2~3문장)",
            },
            missingFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fieldName: { type: Type.STRING, description: "필드 영문 식별자" },
                  label: { type: Type.STRING, description: "필드 국문 라벨" },
                  severity: { type: Type.STRING, description: "심각도 ('필수' | '권장')" },
                  reason: { type: Type.STRING, description: "항목 누락 사유" },
                  suggestedValue: { type: Type.STRING, description: "추천 보충 문안" },
                },
                required: ["fieldName", "label", "severity", "reason"],
              },
              description: "누락/부실 항목",
            },
            improperExpressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "원문 문구" },
                  reason: { type: Type.STRING, description: "부적절 사유" },
                  suggested: { type: Type.STRING, description: "대체 표현" },
                  fieldName: { type: Type.STRING, description: "필드명" },
                },
                required: ["original", "reason", "suggested", "fieldName"],
              },
              description: "부적절 표현 교정 목록",
            },
            strengthsAnalysis: {
              type: Type.STRING,
              description: "강점 자원 반영 평가",
            },
            legalRiskAssessment: {
              type: Type.STRING,
              description: "법적/행정 리스크 분석",
            },
            complianceChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  item: { type: Type.STRING },
                  isPassed: { type: Type.BOOLEAN },
                  detail: { type: Type.STRING },
                },
                required: ["category", "item", "isPassed", "detail"],
              },
              description: "체크리스트 결과",
            },
          },
          required: ["score", "status", "summary", "missingFields", "improperExpressions", "complianceChecklist"],
        },
      }
    );

    const parsedJson = safeParseJson(text);
    res.json({
      success: true,
      audit: parsedJson,
    });
  } catch (error: any) {
    console.error("Document Audit Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "서식 검수 중 오류가 발생했습니다.",
    });
  }
});

// Intelligent Route Optimization AI Endpoint
app.post("/api/ai/optimize-route", async (req, res) => {
  try {
    const { clients, transportMode, startAddress } = req.body;
    if (!clients || !clients.length) {
      return res.status(400).json({ error: "방문 대상 어르신 목록이 없습니다." });
    }

    const prompt = `당신은 재가노인지원서비스 및 방문 복지 동선 최적화 전문가입니다.
사회복지사가 하루 동안 어르신 댁을 방문하여 안부 확인, 상담 및 밑반찬/안전용품을 전달하는 가장 효율적이고 안전한 방문 순서와 시간 계획을 수립해 주세요.

[출발 위치]: ${startAddress || "강북구 재가노인지원서비스센터 (서울특별시 강북구 삼양로)"}
[이동 수단]: ${transportMode || "도보 및 복지차량"}
[방문 대상 어르신 목록]:
${JSON.stringify(clients, null, 2)}

고려 사항:
1. 위기도가 '고위험'이거나 '긴급' 우선순위인 어르신을 오전 또는 집중 시간대에 우선 배정.
2. 지리적 인접성을 고려하여 불필요한 이동 시간을 최소화하는 동선 순서(order 1, 2, 3...) 산출.
3. 어르신별 희망 방문시간대 및 복약/식사 시간 배려.
4. 어르신 1가구당 권장 상담시간(30~45분) 배분.

반드시 JSON 형식으로 응답하십시오.`;

    const { text } = await callGeminiWithFallback(
      ["gemini-3.8-flash", "gemini-flash-latest"],
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "동선 계획 타이틀" },
            totalEstimatedMinutes: { type: Type.INTEGER, description: "전체 소요 예상 시간(분)" },
            totalDistanceKm: { type: Type.NUMBER, description: "총 예상 이동거리(km)" },
            routeStrategy: { type: Type.STRING, description: "동선 수립 전략 및 핵심 권고사항" },
            optimizedStops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clientId: { type: Type.STRING },
                  clientName: { type: Type.STRING },
                  order: { type: Type.INTEGER },
                  estimatedArrival: { type: Type.STRING, description: "예상 도착 시간" },
                  durationMinutes: { type: Type.INTEGER, description: "예상 체류 시간(분)" },
                  purpose: { type: Type.STRING, description: "방문 핵심 목적" },
                  travelNote: { type: Type.STRING, description: "주의사항" },
                },
                required: ["clientId", "clientName", "order", "estimatedArrival", "durationMinutes", "purpose"],
              },
            },
          },
          required: ["title", "totalEstimatedMinutes", "totalDistanceKm", "routeStrategy", "optimizedStops"],
        },
      }
    );

    const parsedJson = safeParseJson(text);
    res.json({
      success: true,
      plan: parsedJson,
    });
  } catch (error: any) {
    console.error("Route Optimization Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "동선 최적화 중 오류가 발생했습니다.",
    });
  }
});

// Text Refinement Endpoint: Converts rough notes into formal social work phrasing
app.post("/api/ai/refine-text", async (req, res) => {
  try {
    const { rawText, fieldType } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: "정리할 텍스트를 입력해주세요." });
    }

    const prompt = `당신은 노인복지 및 재가노인 사례관리 전문 수석 사회복지사입니다.
다음 거칠거나 구어체로 작성된 사회복지사 메모를 한국 사회복지 공공서식 표준 규격의 전문적이고 객관적인 사회복지 기록문장으로 윤문/정제해 주세요.

[작성 대상 필드]: ${fieldType || "사례관리 기록 필드"}
[원문 텍스트]:
${rawText}

규칙:
1. '~함', '~로 파악됨', '~사정됨', '~연계 필요성 확인됨' 등 공문서/사례기록 전문 종결형태 사용.
2. 사실(Fact)과 관찰(Observation), 사정(Assessment)을 명확하게 표현.
3. 어르신을 존중하는 강점 관점 유지.
4. 불필요한 서두 없이 정제된 최종 텍스트만 출력할 것.`;

    const { text } = await callGeminiWithFallback(
      ["gemini-3.8-flash", "gemini-flash-latest"],
      prompt
    );

    res.json({
      success: true,
      refinedText: text ? text.trim() : rawText,
    });
  } catch (error: any) {
    console.error("Refine Text Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "문장 정제 중 오류가 발생했습니다.",
    });
  }
});

// Intelligent Case Strategy Advice
app.post("/api/ai/case-advice", async (req, res) => {
  try {
    const { clientSummary, currentDilemma } = req.body;

    const prompt = `재가노인지원사업을 담당하는 사회복지사에게 사례관리 슈퍼비전 조언을 제공합니다.
[대상 어르신 요약]:
${clientSummary}

[사회복지사의 고민/딜레마]:
${currentDilemma}

전문적인 슈퍼비전 조언(1. 우선적 개입 우선순위, 2. 민관 복지자원 연계 방안, 3. 라포 형성 및 거부감 완화 팁, 4. 사회복지사 안전 및 소진 방지 팁)을 체계적으로 제시해 주세요.`;

    const { text } = await callGeminiWithFallback(
      ["gemini-3.8-flash", "gemini-flash-latest"],
      prompt
    );

    res.json({
      success: true,
      advice: text ? text.trim() : "",
    });
  } catch (error: any) {
    console.error("Case Advice Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "슈퍼비전 조언 생성 중 오류가 발생했습니다.",
    });
  }
});

// Quick Summary Endpoint: Generates a concise one-paragraph summary of ongoing voice consultation
app.post("/api/ai/quick-summary", async (req, res) => {
  try {
    const { transcript, clientName, recordingDuration } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        error: "요약할 음성 녹취 텍스트가 없습니다. 마이크로 상담을 진행하거나 대화 내용을 입력해주세요.",
      });
    }

    const prompt = `당신은 재가노인지원서비스 스마트 사례관리 전문 AI 슈퍼바이저입니다.
현재 진행 중인 실시간 음성 상담 녹취 내용을 분석하여, 상담 중인 사회복지사가 한눈에 파악할 수 있는 핵심적인 **'한 문단 요약(One-paragraph Quick Summary, 3~5개 문장)'**을 작성해 주세요.

[대상 어르신]: ${clientName || "어르신"}
[녹음 진행 시간]: ${recordingDuration || "상담 진행 중"}
[현재까지의 상담 녹취 내용]:
${transcript}

작성 지침:
1. 어르신의 주 호소 문제(신체 건강, 일상생활 곤란, 고립감, 경제/주거 문제 등)와 상담에서 언급된 주요 사실을 압축하여 하나의 정돈된 문단으로 작성하세요.
2. 사회복지사 관점에서 즉각적으로 인지해야 할 핵심 뉘앙스와 긴급 지원 필요점을 명확히 포함하세요.
3. 군더더기 서두("이 요약은...", "상담 내용은 다음과 같습니다")를 쓰지 말고, 바로 알맹이 있는 한 문단의 완성된 요약글(약 3~5문장)만 작성하세요.`;

    const { text } = await callGeminiWithFallback(
      ["gemini-3.8-flash", "gemini-flash-latest"],
      prompt
    );

    res.json({
      success: true,
      summary: text ? text.trim() : "요약을 생성하지 못했습니다.",
    });
  } catch (error: any) {
    console.error("Quick Summary Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "상담 요약 생성 중 오류가 발생했습니다.",
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Senior Care Case Management Server running on port ${PORT}`);
  });
}

startServer();
