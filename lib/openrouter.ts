// Server-only. Never import this from a client component.
import https from 'node:https'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Use node:https directly to avoid corporate SSL inspection issues with Node's native fetch
function httpsPost(url: string, headers: Record<string, string>, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
      rejectUnauthorized: false,
    }, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => { data += chunk.toString() })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_details?: unknown
}

const SYSTEM_PROMPT = (lang: string) => `You are a helpful assistant for the Parivahan RTO Learner's Licence application portal in India.
Respond in ${lang === 'hi' ? 'Hindi (Devanagari script)' : lang === 'kn' ? 'Kannada script' : 'English'}.

You ONLY answer questions about:
- Eligibility requirements for a Learner's Licence (age 16+ for motorcycles <50cc, 18+ for others; valid address proof; valid identity proof)
- Required documents: Aadhaar/PAN/Voter ID (identity), utility bill/bank statement (address), passport photo, medical certificate if needed
- Fees: ₹200 for learner's licence application + ₹50 test fee (total ₹250)
- Process steps: Online form → Document upload → Fee payment → RTO review (2-5 working days) → Driving test → Licence issued
- General procedural questions about this portal

You CANNOT see, read, or access the citizen's form data or application details. If asked, say clearly: "I cannot see what you've entered in the form — I can only explain the process."

You NEVER make or imply an approval or rejection decision. Approvals are made by RTO officers, not by this assistant.

Keep answers concise and in plain language. Use numbered lists for steps. Be warm and reassuring.`

export const SCRIPTED_FAQ: Record<string, { en: string; hi: string; kn: string }> = {
  eligibility: {
    en: `**Eligibility for Learner's Licence:**\n1. Age 16+ (motorcycles under 50cc), or 18+ (all other vehicles)\n2. Valid address proof (utility bill, bank statement, or Aadhaar)\n3. Valid identity proof (Aadhaar, PAN, Voter ID, or Passport)\n4. No existing DL suspension\n\nYou don't need to visit an RTO office for the application — the driving test is the only in-person step.`,
    hi: `**लर्नर लाइसेंस के लिए पात्रता:**\n1. उम्र 16+ (50cc से कम मोटरसाइकिल), या 18+ (अन्य वाहन)\n2. वैध पता प्रमाण (बिजली बिल, बैंक स्टेटमेंट, या आधार)\n3. वैध पहचान प्रमाण (आधार, पैन, वोटर आईडी, या पासपोर्ट)\n4. कोई मौजूदा DL निलंबन नहीं`,
    kn: `**ಲರ್ನರ್ ಲೈಸೆನ್ಸ್‌ಗೆ ಅರ್ಹತೆ:**\n1. ವಯಸ್ಸು 16+ (50cc ಕಡಿಮೆ ಮೋಟಾರ್‌ಸೈಕಲ್), ಅಥವಾ 18+ (ಇತರ ವಾಹನಗಳು)\n2. ಮಾನ್ಯ ವಿಳಾಸ ಪುರಾವೆ\n3. ಮಾನ್ಯ ಗುರುತಿನ ಪ್ರಮಾಣ\n4. ಯಾವುದೇ DL ಅಮಾನತು ಇಲ್ಲ`,
  },
  documents: {
    en: `**Documents needed:**\n1. **Identity proof** (any one): Aadhaar card, PAN card, Voter ID, or Passport\n2. **Address proof** (any one): Utility bill (last 3 months), bank statement, or Aadhaar\n3. **Passport-size photo**: 1 recent photo with white background\n4. **Age proof**: Birth certificate or 10th marksheet\n\nAll documents are uploaded digitally — no physical copies needed.`,
    hi: `**आवश्यक दस्तावेज़:**\n1. **पहचान प्रमाण** (कोई एक): आधार, पैन, वोटर आईडी, या पासपोर्ट\n2. **पता प्रमाण** (कोई एक): बिजली बिल, बैंक स्टेटमेंट, या आधार\n3. **पासपोर्ट फोटो**: 1 हाल की फोटो\n4. **आयु प्रमाण**: जन्म प्रमाण पत्र या 10वीं की मार्कशीट`,
    kn: `**ಅಗತ್ಯ ದಾಖಲೆಗಳು:**\n1. **ಗುರುತಿನ ಪ್ರಮಾಣ**: ಆಧಾರ್, ಪ್ಯಾನ್, ಮತದಾರ ಐಡಿ, ಅಥವಾ ಪಾಸ್‌ಪೋರ್ಟ್\n2. **ವಿಳಾಸ ಪ್ರಮಾಣ**: ವಿದ್ಯುತ್ ಬಿಲ್, ಬ್ಯಾಂಕ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್\n3. **ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ**: 1 ಇತ್ತೀಚಿನ ಫೋಟೋ`,
  },
  fees: {
    en: `**Fee breakdown:**\n- Learner's Licence application: ₹200\n- Driving test slot: ₹50\n- **Total: ₹250**\n\nPayment is online (UPI, debit/credit card, net banking). You'll get a receipt immediately. If payment is deducted but status doesn't update, use the "Payment issue?" link — it resolves automatically within minutes.`,
    hi: `**शुल्क विवरण:**\n- लर्नर लाइसेंस आवेदन: ₹200\n- ड्राइविंग टेस्ट स्लॉट: ₹50\n- **कुल: ₹250**\n\nभुगतान ऑनलाइन है (UPI, डेबिट/क्रेडिट कार्ड)। रसीद तुरंत मिलेगी।`,
    kn: `**ಶುಲ್ಕ ವಿವರ:**\n- ಲರ್ನರ್ ಲೈಸೆನ್ಸ್ ಅರ್ಜಿ: ₹200\n- ಡ್ರೈವಿಂಗ್ ಟೆಸ್ಟ್ ಸ್ಲಾಟ್: ₹50\n- **ಒಟ್ಟು: ₹250**`,
  },
  timeline: {
    en: `**Typical timeline:**\n1. Submit application → **Immediate confirmation**\n2. RTO officer review → **2–5 working days**\n3. Driving test → **Booked after approval** (slots available statewide)\n4. Licence issued → **Same day as test** (digital), physical copy by post in 7 days\n\nYou'll get SMS/notification at each step. No office visit until the driving test.`,
    hi: `**सामान्य समय सीमा:**\n1. आवेदन जमा करें → **तुरंत पुष्टि**\n2. RTO अधिकारी की समीक्षा → **2-5 कार्यदिवस**\n3. ड्राइविंग टेस्ट → **अनुमोदन के बाद बुक करें**\n4. लाइसेंस जारी → **टेस्ट के दिन** (डिजिटल)`,
    kn: `**ಸಾಮಾನ್ಯ ಸಮಯ:**\n1. ಅರ್ಜಿ ಸಲ್ಲಿಸಿ → **ತಕ್ಷಣ ದೃಢೀಕರಣ**\n2. RTO ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ → **2-5 ಕೆಲಸದ ದಿನಗಳು**\n3. ಡ್ರೈವಿಂಗ್ ಟೆಸ್ಟ್ → **ಅನುಮೋದನೆ ನಂತರ**`,
  },
}

export async function callAssistant(messages: ChatMessage[], lang = 'en'): Promise<ChatMessage> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const systemMessage: ChatMessage = { role: 'system', content: SYSTEM_PROMPT(lang) }
  const fullMessages = [systemMessage, ...messages]

  const body = JSON.stringify({
    model: 'stealth/ox-alpha',
    messages: fullMessages,
    reasoning: { enabled: true },
  })

  const res = await httpsPost(OPENROUTER_URL, {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://rto-demo.local',
    'X-Title': 'Parivahan RTO Demo',
  }, body)

  if (res.status < 200 || res.status >= 300) {
    console.error('[OPENROUTER]', res.status, res.body.slice(0, 200))
    throw new Error(`OpenRouter request failed: ${res.status}`)
  }
  const result = JSON.parse(res.body)
  return result.choices[0].message
}

export function getFallbackResponse(userMessage: string, lang: 'en' | 'hi' | 'kn' = 'en'): string {
  const lower = userMessage.toLowerCase()
  if (lower.includes('eligib') || lower.includes('age') || lower.includes('qualify')) {
    return SCRIPTED_FAQ.eligibility[lang]
  }
  if (lower.includes('doc') || lower.includes('paper') || lower.includes('proof') || lower.includes('upload')) {
    return SCRIPTED_FAQ.documents[lang]
  }
  if (lower.includes('fee') || lower.includes('cost') || lower.includes('pay') || lower.includes('money') || lower.includes('₹')) {
    return SCRIPTED_FAQ.fees[lang]
  }
  if (lower.includes('time') || lower.includes('long') || lower.includes('days') || lower.includes('when')) {
    return SCRIPTED_FAQ.timeline[lang]
  }

  const defaults: Record<string, string> = {
    en: `I can help you with:\n- **Eligibility** requirements\n- **Documents** needed\n- **Fees** (₹250 total)\n- **Process timeline**\n- **What happens after submission**\n\nWhat would you like to know?`,
    hi: `मैं इनमें मदद कर सकता हूं:\n- **पात्रता** आवश्यकताएं\n- **दस्तावेज़** की जरूरत\n- **शुल्क** (कुल ₹250)\n- **प्रक्रिया समयरेखा**\n\nआप क्या जानना चाहते हैं?`,
    kn: `ನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n- **ಅರ್ಹತೆ** ಅವಶ್ಯಕತೆಗಳು\n- **ದಾಖಲೆಗಳು** ಅಗತ್ಯ\n- **ಶುಲ್ಕ** (ಒಟ್ಟು ₹250)\n- **ಪ್ರಕ್ರಿಯೆ ಸಮಯ**`,
  }
  return defaults[lang] || defaults.en
}
