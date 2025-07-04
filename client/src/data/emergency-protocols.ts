import { EmergencyProtocol } from "@/types/emergency";

export const emergencyProtocols: Record<string, EmergencyProtocol> = {
  fire: {
    id: 1,
    type: "fire",
    name: "Fire Emergency",
    description: "Protocol for fire emergencies",
    instructions: {
      steps: [
        "Stay low and exit immediately - crawl under smoke and head to the nearest exit",
        "Call emergency services - dial 911 or your local emergency number",
        "Go to meeting point - gather at designated safe location",
        "Do not use elevators - use stairs only",
        "If trapped, signal for help - use bright cloth or flashlight at window"
      ],
      warnings: [
        "Never use water on electrical fires",
        "Check doors for heat before opening",
        "Don't go back inside for belongings"
      ],
      supplies: [
        "Fire extinguisher",
        "Smoke alarm",
        "Escape ladder",
        "Emergency contact list"
      ]
    },
    severity: "high",
    category: "structural",
    languages: {
      en: "Fire Emergency",
      es: "Emergencia de Incendio",
      fr: "Urgence Incendie",
      hi: "आग की आपातकाल",
      ar: "حالة طوارئ حريق"
    },
    createdAt: new Date(),
  },
  medical: {
    id: 2,
    type: "medical",
    name: "Medical Emergency",
    description: "Protocol for medical emergencies",
    instructions: {
      steps: [
        "Check for responsiveness - tap shoulders and shout 'Are you OK?'",
        "Call emergency services immediately - dial 911",
        "Check airway, breathing, and circulation",
        "Begin CPR if trained and necessary",
        "Control bleeding with direct pressure",
        "Keep person warm and comfortable"
      ],
      warnings: [
        "Don't move person unless in immediate danger",
        "Don't give food or water to unconscious person",
        "Don't leave person alone if possible"
      ],
      supplies: [
        "First aid kit",
        "Emergency medications",
        "Emergency contact information",
        "Medical history summary"
      ]
    },
    severity: "critical",
    category: "medical",
    languages: {
      en: "Medical Emergency",
      es: "Emergencia Médica",
      fr: "Urgence Médicale",
      hi: "चिकित्सा आपातकाल",
      ar: "حالة طوارئ طبية"
    },
    createdAt: new Date(),
  },
  earthquake: {
    id: 3,
    type: "earthquake",
    name: "Earthquake",
    description: "Protocol for earthquake emergencies",
    instructions: {
      steps: [
        "Drop, cover, and hold on - get under sturdy furniture",
        "Stay away from windows and heavy objects",
        "If outdoors, move away from buildings and power lines",
        "If in car, pull over and stay inside",
        "Wait for shaking to stop completely",
        "Exit building when safe using stairs, not elevators"
      ],
      warnings: [
        "Don't run outside during shaking",
        "Don't stand in doorways",
        "Watch for aftershocks"
      ],
      supplies: [
        "Emergency kit with water and food",
        "First aid supplies",
        "Battery-powered radio",
        "Flashlight and batteries"
      ]
    },
    severity: "high",
    category: "natural",
    languages: {
      en: "Earthquake",
      es: "Terremoto",
      fr: "Tremblement de terre",
      hi: "भूकंप",
      ar: "زلزال"
    },
    createdAt: new Date(),
  },
  flood: {
    id: 4,
    type: "flood",
    name: "Flood Warning",
    description: "Protocol for flood emergencies",
    instructions: {
      steps: [
        "Move to higher ground immediately",
        "Avoid walking or driving through flood water",
        "If trapped in building, go to highest floor",
        "Signal for help from highest point",
        "Listen to emergency broadcasts",
        "Don't return until authorities say it's safe"
      ],
      warnings: [
        "6 inches of water can knock you down",
        "12 inches can carry away a car",
        "Don't drive through flooded roads"
      ],
      supplies: [
        "Emergency kit with food and water",
        "Waterproof container for documents",
        "Battery-powered radio",
        "Life jackets or flotation devices"
      ]
    },
    severity: "medium",
    category: "natural",
    languages: {
      en: "Flood Warning",
      es: "Alerta de Inundación",
      fr: "Alerte d'Inondation",
      hi: "बाढ़ की चेतावनी",
      ar: "تحذير من الفيضانات"
    },
    createdAt: new Date(),
  },
  tornado: {
    id: 5,
    type: "tornado",
    name: "Tornado Warning",
    description: "Protocol for tornado emergencies",
    instructions: {
      steps: [
        "Go to lowest floor and interior room",
        "Stay away from windows and doors",
        "Get under heavy furniture if possible",
        "Protect head and neck with arms",
        "If outdoors, lie flat in low area",
        "Don't try to outrun tornado in car"
      ],
      warnings: [
        "Don't open windows",
        "Don't go outside to look",
        "Don't take shelter in wide-span buildings"
      ],
      supplies: [
        "Emergency kit",
        "Weather radio",
        "Helmet or protective headgear",
        "Sturdy shoes"
      ]
    },
    severity: "high",
    category: "natural",
    languages: {
      en: "Tornado Warning",
      es: "Alerta de Tornado",
      fr: "Alerte de Tornade",
      hi: "बवंडर की चेतावनी",
      ar: "تحذير من الإعصار"
    },
    createdAt: new Date(),
  }
};

export const getEmergencyProtocol = (type: string): EmergencyProtocol | undefined => {
  return emergencyProtocols[type];
};

export const getAllEmergencyProtocols = (): EmergencyProtocol[] => {
  return Object.values(emergencyProtocols);
};

export const getEmergencyProtocolsByCategory = (category: string): EmergencyProtocol[] => {
  return Object.values(emergencyProtocols).filter(protocol => protocol.category === category);
};

export const getEmergencyProtocolsBySeverity = (severity: string): EmergencyProtocol[] => {
  return Object.values(emergencyProtocols).filter(protocol => protocol.severity === severity);
};
