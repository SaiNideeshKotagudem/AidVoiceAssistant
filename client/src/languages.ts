export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  supported: boolean;
}

export const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    supported: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    supported: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    supported: true,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    rtl: false,
    supported: true,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    supported: true,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
    supported: false,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    supported: false,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    supported: false,
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    supported: false,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false,
    supported: false,
  },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return supportedLanguages.find(lang => lang.code === code);
};

export const getSupportedLanguages = (): Language[] => {
  return supportedLanguages.filter(lang => lang.supported);
};

export const getLanguageName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language?.name || code.toUpperCase();
};

export const getLanguageNativeName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language?.nativeName || code.toUpperCase();
};

export const isRTL = (code: string): boolean => {
  const language = getLanguageByCode(code);
  return language?.rtl || false;
};

export const emergencyPhrases = {
  en: {
    help: "Help!",
    emergency: "Emergency!",
    fire: "Fire!",
    medical: "Medical emergency!",
    police: "Call police!",
    ambulance: "Call ambulance!",
    earthquake: "Earthquake!",
    flood: "Flood!",
    tornado: "Tornado!",
    hurt: "Someone is hurt!",
    stuck: "Someone is stuck!",
    lost: "I am lost!",
    safe: "I am safe",
    location: "My location is",
    contact: "Please contact",
  },
  es: {
    help: "¡Ayuda!",
    emergency: "¡Emergencia!",
    fire: "¡Fuego!",
    medical: "¡Emergencia médica!",
    police: "¡Llamen a la policía!",
    ambulance: "¡Llamen a la ambulancia!",
    earthquake: "¡Terremoto!",
    flood: "¡Inundación!",
    tornado: "¡Tornado!",
    hurt: "¡Alguien está herido!",
    stuck: "¡Alguien está atrapado!",
    lost: "¡Estoy perdido!",
    safe: "Estoy seguro",
    location: "Mi ubicación es",
    contact: "Por favor contacten",
  },
  fr: {
    help: "Aidez-moi!",
    emergency: "Urgence!",
    fire: "Feu!",
    medical: "Urgence médicale!",
    police: "Appelez la police!",
    ambulance: "Appelez l'ambulance!",
    earthquake: "Tremblement de terre!",
    flood: "Inondation!",
    tornado: "Tornade!",
    hurt: "Quelqu'un est blessé!",
    stuck: "Quelqu'un est coincé!",
    lost: "Je suis perdu!",
    safe: "Je suis en sécurité",
    location: "Ma position est",
    contact: "Veuillez contacter",
  },
  hi: {
    help: "मदद!",
    emergency: "आपातकाल!",
    fire: "आग!",
    medical: "चिकित्सा आपातकाल!",
    police: "पुलिस को बुलाओ!",
    ambulance: "एम्बुलेंस को बुलाओ!",
    earthquake: "भूकंप!",
    flood: "बाढ़!",
    tornado: "बवंडर!",
    hurt: "कोई घायल है!",
    stuck: "कोई फंसा है!",
    lost: "मैं खो गया हूं!",
    safe: "मैं सुरक्षित हूं",
    location: "मेरी स्थिति है",
    contact: "कृपया संपर्क करें",
  },
  ar: {
    help: "مساعدة!",
    emergency: "طوارئ!",
    fire: "حريق!",
    medical: "طوارئ طبية!",
    police: "اتصلوا بالشرطة!",
    ambulance: "اتصلوا بالإسعاف!",
    earthquake: "زلزال!",
    flood: "فيضان!",
    tornado: "إعصار!",
    hurt: "شخص مصاب!",
    stuck: "شخص عالق!",
    lost: "أنا ضائع!",
    safe: "أنا آمن",
    location: "موقعي هو",
    contact: "يرجى الاتصال",
  },
};

export const getEmergencyPhrase = (code: string, key: string): string => {
  const phrases = emergencyPhrases[code as keyof typeof emergencyPhrases];
  return phrases?.[key as keyof typeof phrases] || key;
};
