# पण्डित जी ऑनलाइन - Android APK गाइड (How to Get & Download APK)

यह प्रोजेक्ट **Google AI Studio** में निर्मित एक आधुनिक **फुल-स्टैक वेब एवं प्रोग्रेसिव वेब ऍप (PWA)** है।

कोड सेक्शन में मुख्य रूप से सोर्स कोड (React, TypeScript, Express, Vite) फ़ाइलें होती हैं। बाइनरी `.apk` फ़ाइल प्राप्त करने के लिए निम्नलिखित 2 आसान तरीके उपलब्ध हैं:

---

### विधि 1: 1-क्लिक में .APK फ़ाइल डाउनलोड करना (PWABuilder - सबसे आसान)

1. अपने कंप्यूटर या मोबाइल में **[PWABuilder](https://www.pwabuilder.com/)** वेबसाइट खोलें।
2. वहां अपनी लाइव ऐप का लिंक पेस्ट करें:
   ```text
   https://ais-pre-vzln7mn7lygnkockjoehu3-746834689688.asia-east1.run.app
   ```
3. **Start** पर क्लिक करें। यह आपके `manifest.json` और `sw.js` को ऑटोमैटिक स्कैन करेगा।
4. **"Package for Android"** बटन पर क्लिक करें।
5. आपके लिए हस्ताक्षरित (Signed) **`.apk` फ़ाइल** और Google Play Store हेतु **`.aab` फ़ाइल** तुरंत डाउनलोड हो जाएगी।

---

### विधि 2: मोबाइल पर सीधे इंस्टॉल करना (बिना APK डाउनलोड किए)

1. अपने Android मोबाइल के Google Chrome में यह लिंक खोलें:
   `https://ais-pre-vzln7mn7lygnkockjoehu3-746834689688.asia-east1.run.app`
2. ऊपर दाईं ओर **3 बिंदुओं (⋮)** पर टैप करें।
3. **"Install app" (ऐप इंस्टॉल करें)** या **"Add to Home screen" (होम स्क्रीन में जोड़ें)** चुनें।
4. यह आपके मोबाइल में एक असली Android App (WebAPK) की तरह होम स्क्रीन पर जुड़ जाएगा।

---

### विधि 3: Android Studio (Capacitor) द्वारा स्वयं APK बिल्ड करना

यदि आप स्थानीय कंप्यूटर पर Android Studio से APK कंपाइल करना चाहते हैं:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "पण्डित जी ऑनलाइन" "com.panditjionline.app"
npm run build
npx cap add android
npx cap copy
npx cap open android
```
इसके बाद Android Studio में **Build > Build Bundle(s) / APK(s) > Build APK(s)** पर क्लिक करें। आपकी `app-debug.apk` तैयार हो जाएगी।
