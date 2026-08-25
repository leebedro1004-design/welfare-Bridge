import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Server-side Gemini initialization with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
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
사용자(사회복지사)가 제공한 어르신 상담 녹취록(STT) 또는 상담 메모를 분석하여, 한국 사회복지 표준 사례관리 양식인 [${targetDocName}]에 완벽하게 부합하는 서식 데이터를 전문적이고 체계적인 사회복지 기록 어조(전문 용어, 객관적 사실 기반, 강점 관점, 구체적 위험요인 분석)로 작성하십시오.

작성 원칙:
1. 객관적 사실(어르신의 발언, 주거/신체 상태, 경제상황)과 사회복지사의 전문적 판단/사정 의견을 명확히 구분합니다.
2. 재가노인지원사업의 핵심 목적인 '예방적 복지(사각지대 발굴, 고립 예방, 낙상/건강위험 조기대응, 일상생활 유지)'에 초점을 맞춥니다.
3. ADL(일상생활수행능력), I-ADL(도구적일상생활수행능력), 건강/복약, 주거안전, 경제상태, 사회심리/정서적 고립감, 안전망 유무를 면밀히 분석합니다.
4. 부족한 정보는 녹취록 맥락에서 논리적으로 유추 가능한 범위 내에서 현실적인 가이드 문장으로 구성하되, 확인이 필요한 사항은 [확인 필요]로 명시합니다.
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptContent,
      config: {
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
              description: "어르신의 주요 욕구 및 문제 목록",
            },
            physicalHealthStatus: {
              type: Type.STRING,
              description: "신체 및 건강 상태, 질환, 복약 실태",
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
            formSpecificFields: {
              type: Type.OBJECT,
              properties: {
                conferenceTopic: { type: Type.STRING, description: "사례회의 안건 (사례회의록용)" },
                conferenceDiscussion: { type: Type.STRING, description: "사례회의 논의 내용 요약" },
                conferenceDecision: { type: Type.STRING, description: "사례회의 결정 사항 및 역할 분담" },
                monitoringChange: { type: Type.STRING, description: "직전 대비 변화 상태 (모니터링용)" },
                monitoringActionTaken: { type: Type.STRING, description: "금회 조치 및 지도 사항" },
                terminationReason: { type: Type.STRING, description: "종결 사유 (종결보고서용)" },
                goalAchievementRate: { type: Type.STRING, description: "목표 달성도 평가 (종결/평가서용)" },
                followUpPlan: { type: Type.STRING, description: "사후관리 및 모니터링 계획" },
              },
              description: "선택된 서식 전용 특화 필드",
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
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      documentType,
      result: parsedJson,
    });
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptContent,
      config: {
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
                  fieldName: { type: Type.STRING, description: "필드 영문 식별자 (예: riskRationale, shortTermGoals, physicalHealthStatus 등)" },
                  label: { type: Type.STRING, description: "필드 국문 라벨 (예: 위기도 판정 근거, 단기 개입 목표 등)" },
                  severity: { type: Type.STRING, description: "심각도 ('필수' | '권장')" },
                  reason: { type: Type.STRING, description: "항목 누락 시 발생하는 감사/실천적 문제점" },
                  suggestedValue: { type: Type.STRING, description: "녹취 또는 대상자 정보 기반 추천 보충 문안" },
                },
                required: ["fieldName", "label", "severity", "reason"],
              },
              description: "누락되거나 내용이 부실한 필수/권장 항목 목록",
            },
            improperExpressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "문서 내 발견된 부적절/소극적/낙인적 원문 문구" },
                  reason: { type: Type.STRING, description: "부적절성 사유 (주관적 편견, 비난, 의학적 단정 등)" },
                  suggested: { type: Type.STRING, description: "강점 관점 및 전문적 사회복지 대체 표현" },
                  fieldName: { type: Type.STRING, description: "해당 문구가 포함된 필드명" },
                },
                required: ["original", "reason", "suggested", "fieldName"],
              },
              description: "부적절하거나 부정적인 표현 교정 제안 목록",
            },
            strengthsAnalysis: {
              type: Type.STRING,
              description: "대상 어르신의 잔존 능력 및 강점 자원 반영 여부 평가",
            },
            legalRiskAssessment: {
              type: Type.STRING,
              description: "법적/행정적 감사 리스크 분석 (개인정보, 긴급 안전망, 지침 준수 등)",
            },
            complianceChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "검수 범주 (인적사항, 사정의 구체성, 목표 설정, 윤리성 등)" },
                  item: { type: Type.STRING, description: "세부 검수 항목명" },
                  isPassed: { type: Type.BOOLEAN, description: "통과 여부" },
                  detail: { type: Type.STRING, description: "세부 근거 및 해설" },
                },
                required: ["category", "item", "isPassed", "detail"],
              },
              description: "표준 가이드라인 체크리스트 통과 현황",
            },
          },
          required: ["score", "status", "summary", "missingFields", "improperExpressions", "complianceChecklist"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
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
                  estimatedArrival: { type: Type.STRING, description: "예상 도착 시간 (예: '10:00')" },
                  durationMinutes: { type: Type.INTEGER, description: "예상 체류/상담 시간(분)" },
                  purpose: { type: Type.STRING, description: "방문 핵심 목적 (예: 긴급 낙상후유증 점검, 복약 및 밑반찬 배달)" },
                  travelNote: { type: Type.STRING, description: "이동 및 방문 시 주의사항" },
                },
                required: ["clientId", "clientName", "order", "estimatedArrival", "durationMinutes", "purpose"],
              },
            },
          },
          required: ["title", "totalEstimatedMinutes", "totalDistanceKm", "routeStrategy", "optimizedStops"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      refinedText: response.text ? response.text.trim() : rawText,
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      advice: response.text ? response.text.trim() : "",
    });
  } catch (error: any) {
    console.error("Case Advice Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "슈퍼비전 조언 생성 중 오류가 발생했습니다.",
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
