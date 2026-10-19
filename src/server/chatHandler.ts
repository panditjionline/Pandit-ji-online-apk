import { GoogleGenAI } from '@google/genai';

const PANDIT_SHASHANK_SYSTEM_INSTRUCTION = `
You are Pandit Shashank Sharma, founder and lead Vedic scholar of "Pandit ji online" (Official Phone/WhatsApp: +91 70172 79043, Official YouTube Channel: https://youtube.com/@panditjionlineofficial).
You reside and perform sacred pujas, hawans, and jyotish consultations in Rudrapur, Uttarakhand (covering Indra Colony, Awas Vikas, Transit Camp, Kichha Road, Dineshpur Road, Alliance City, Metropolis, Pantnagar, etc.). Devotees can book Vedic puja at their home in Rudrapur, and can book One-on-One personal astrology/kundali consultation over phone/WhatsApp call (special Dakshina मात्र ₹100, down from ₹1,000). Note: We do NOT perform generic "online e-sankalp" rituals; pujas are performed authentically in person at devotee homes in Rudrapur. Direct contact number: 7017279043.

YOUR PERSONALITY & TONE:
1. Vedic Wisdom & Calm Warmth: You speak with deep humility, respect, and reverence ("Radhe Radhe", "Jai Shri Ram", "Namaskar", "Har Har Mahadev").
2. Natural, Educated Hinglish/Hindi: You speak like an authentic, highly educated, modern Vedic scholar—clear, thoughtful, lucid, and empathetic. If the user writes in English, reply in cultured English with Sanskrit/Vedic terms explained.
3. No Robotic AI Cliches: NEVER sound like a canned customer service bot. Never say "As an AI..." or "I am an artificial intelligence". You are Pandit Shashank Sharma. Speak in first person ("Humare shastron ke anusaar...", "Mera anubhav yeh kehta hai...").

CRITICAL CORE RULES:
1. BALANCED PERSPECTIVE (Mandatory): Whenever you explain any Graha (planetary placement), Dosh (Kaal Sarp, Manglik, Shani Sade Sati), gemstone, ritual, or life choice, you MUST explicitly present BOTH:
   - Positive aspects (Shubhta, divine potential, hidden blessings, spiritual strength, karma balancing).
   - Challenging aspects & precautions (Savdhani, pros & cons, rules that must be maintained, consequences if done incorrectly or casually).
   Remind them that in Vedic Jyotish, no planet is an absolute enemy; each is a karmic teacher.
2. CONTEXTUAL UNDERSTANDING: Instantly catch what the devotee is experiencing. Acknowledge their situation with patience and insight.
3. ACTION-ORIENTED GUIDANCE:
   - Direct them gently to the relevant features in the app:
     * "Kundali Milan" (36 Gun Milan) tab where boy and girl names can be matched for Ashta-Koot compatibility with full gun details.
     * "Services & Booking" tab for Griha Pravesh, Satyanarayan Katha, Hawan, Rudrabhishek at home in Rudrapur (all at 50% discount) and Personal Consultation (₹100).
     * "Daily Panchang" for today's auspicious Tithi, Abhijit Muhurat, and Rahu Kaal.
     * "Official YouTube Feed" (https://youtube.com/@panditjionlineofficial) for authentic videos on Puja Vidhi and Jyotish Gyan.
   - If they seek Kundali analysis, politely guide them to provide: Date of Birth, Exact Time, Place of Birth, and Gotra (if known).
`;

export async function handleChatMessage(userMessage: string, history: Array<{ role: string; parts: Array<{ text: string }> }>) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Format previous history for Gemini
      const formattedContents = [
        ...history.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: msg.parts,
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: PANDIT_SHASHANK_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (responseText && responseText.trim().length > 0) {
        return { reply: responseText.trim() };
      }
    } catch (err: unknown) {
      console.error('Gemini API call failed, using intelligent Vedic analytical fallback:', err);
    }
  }

  // Fallback intelligent Vedic responder modeling Pandit Shashank Sharma
  return { reply: generateVedicFallbackResponse(userMessage) };
}

function generateVedicFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('griha pravesh') || lower.includes('home') || lower.includes('makan') || lower.includes('vastu')) {
    return `Radhe Radhe! Griha Pravesh ek atyant pavitra sanskaar hai jisse naye ghar mein sakaratmak urja (positive vibrations) aur Vastu Devta ka aashirwad sthaapit hota hai.

Hum Rudrapur (Awas Vikas, Indra Colony, Transit Camp, Kichha Road sahit) mein shastrokta vidhi se Vastu Pujan, Navgrah Havan, aur Shanti path sampann karate hain.

★ Santulit Vishleshan (Pros & Considerations):
• Shubh Labh (Positives): Vastu dosh ka shaman hota hai, parivaar mein swasthya, lakshmi aur shanti aati hai. Agni dev ke aahuti se sthaan shuddh hota hai.
• Savdhaniyan (Precautions): Griha pravesh hamesha shubh tithi, nakshatra aur shubh lagn mein hi karna chahiye (Rahu Kaal aur Bhadra ka tyag anivarya hai). Naye ghar mein pravesh se pehle Mangal Kalash sthapana aur Gau-mata pujan avashya karein.

Aap "Services & Booking" tab mein jaakar apne anukul tithi par Griha Pravesh book kar sakte हैं।`;
  }

  if (lower.includes('kundali') || lower.includes('janam patri') || lower.includes('horoscope') || lower.includes('milan')) {
    return `Jai Shri Ram! Kundali aapke poorv janmon ke sanchit karm aur grah sthiti ka ek aayna (mirror) hai.

★ Santulit Drishtikon (Pros & Cons of Kundali Reading):
• Sakaratmak Paksh: Kundali vishleshan se aapke shubh grahon (jaise Brihaspati ya Shukra) ka bal jaan kar aap sahi kshetr, vyapar aur aatm-shanti ka marg chun sakte hain.
• Savdhani: Jyotish ko bhagyavadi (fatalistic) bankar nahi, balki purusharth (karm) ke margdarshak ke roop mein dekhna chahiye. Koi bhi Grah shatru nahi hota; pratyek grah humein atma-anushasan sikhata hai.

Aapki vistrit kundali vishleshan ya gun-milan ke liye:
1. Janam Tithi (Date of Birth)
2. Janam Samay (Exact Time)
3. Janam Sthan (Birth Place)
4. Gotra (Yadi pata ho)

Aap ye details yahan chat mein likh sakte hain ya "Services" tab se direct Jyotish Paramarsh (matra ₹100) book kar sakte hain.`;
  }

  if (lower.includes('satyanarayan') || lower.includes('katha') || lower.includes('prasad')) {
    return `Har Har Mahadev! Bhagwan Shri Satyanarayan ki katha kaliyug mein sabse saral aur faldayi anushthan hai.

★ Santulit Paksh:
• Labh: Parivaar mein ekta, sankalp siddhi aur kalyan hota hai. Shriman Narayan aur Mata Lakshmi ki kripa se asantosh dur hota hai.
• Savdhani: Katha shravan karte samay man ki ekagrata aur sachche man se prasad grahan karna aavashyak hai. Sankalp lene ke baad use poora karna hi shastra sammat hai.

Aap Rudrapur mein apne ghar par Satyanarayan katha hamare dwara aayojit karva sakte hain (50% vishesh chhoot ke sath). Hamare YouTube channel (@panditjionlineofficial) par bhi maine iski vidhi aur mahatva vistrit roop se samjhaya hai.`;
  }

  if (lower.includes('shani') || lower.includes('sade sati') || lower.includes('rahu') || lower.includes('mangal') || lower.includes('dosh')) {
    return `Namaskar! Jyotish mein Shani Dev ya Rahu ko lekar samaj mein anavashyak bhay (fear) failaya jata hai, jabki vastavikta santulit hai.

★ Santulit Vishleshan (Pros & Cons):
• Positive Aspects: Shani Dev nyayadhish hain. Sade Sati ya Shani dasha mein vyakti dharatal par aakar parishram seekhta hai, aalsya dur hota hai aur aatm-nirbhar banta hai. Rahu achanak aavishkarak buddhi aur ucch saphalta bhi deta hai.
• Precautions & Remedies: In dashaon mein kisi ke sath anyay na karein, jhooth na bolein, aur Shani Shanti ya Mahamrityunjaya Jap karein.

Aap hamare "Services" tab se Navgrah Shanti ya Jap anushthan book kar sakte hain.`;
  }

  return `Radhe Radhe! Main Pandit Shashank Sharma ("Pandit ji online"). Rudrapur (Uttarakhand) aur sampoorn vishva ke shradhaluon ke kalyanarth hum satat tatpar hain.

Aap mujhse:
1. Ghar ki Puja (Griha Pravesh, Satyanarayan Katha, Hawan, Rudrabhishek) - Rudrapur mein aapke ghar par (50% chhoot)
2. 36 Gun Kundali Milan (Var-Kanya vivah gun milan evam Ashta-Koot vishleshan)
3. One-on-One Vistrit Kundali Paramarsh (Phone / WhatsApp call par - matra ₹100 dakshina)
4. Shubh Muhurat, Gotra Niyam, aur Shastrokta niyam

ke vishay mein koi bhi prashna pooch sakte hain. Main pratyek vishay par dono paksh (Labh aur Savdhaniyan) santulit roop se spasht karoonga. Kahiye, aaj kis vishay par charcha karein?`;
}
