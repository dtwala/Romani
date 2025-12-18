
export interface PluginCategory {
  name: string;
  description: string;
  icon: string;
  commonTypes: {
    name: string;
    description: string;
    examples: string[];
  }[];
}

export const PLUGIN_CATALOG: PluginCategory[] = [
  {
    name: "Dynamics",
    description: "Control the volume (amplitude) of a sound over time.",
    icon: "🗜️",
    commonTypes: [
      {
        name: "Compressors",
        description: "Narrow the dynamic range by making loud parts quieter.",
        examples: ["FabFilter Pro-C 2", "Waves CLA-76", "UA 1176"]
      },
      {
        name: "Limiters",
        description: "Prevent audio from exceeding a set ceiling.",
        examples: ["iZotope Ozone 11 Maximizer", "FabFilter Pro-L 2", "Waves L2"]
      },
      {
        name: "Expanders/Gates",
        description: "Reduce volume of signals below a threshold.",
        examples: ["FabFilter Pro-G", "Waves SSL G-Channel Gate"]
      }
    ]
  },
  {
    name: "Spectral",
    description: "Manipulate the frequency balance of a signal.",
    icon: "📈",
    commonTypes: [
      {
        name: "Parametric EQ",
        description: "Precise frequency adjustment with boost/cut and Q control.",
        examples: ["FabFilter Pro-Q 3", "Waves Renaissance EQ", "Sonnox Oxford EQ"]
      },
      {
        name: "Dynamic EQ",
        description: "EQ bands that only trigger when a threshold is crossed.",
        examples: ["Waves F6", "TDR Nova", "Soothe2 (Resonance Suppressor)"]
      }
    ]
  },
  {
    name: "Spatial",
    description: "Create depth, width, and an acoustic environment.",
    icon: "🌊",
    commonTypes: [
      {
        name: "Reverb",
        description: "Simulate the sound of physical spaces.",
        examples: ["Valhalla VintageVerb", "Altiverb", "FabFilter Pro-R 2"]
      },
      {
        name: "Delay/Echo",
        description: "Create repetitions of the signal for depth and rhythm.",
        examples: ["Soundtoys EchoBoy", "Waves H-Delay", "Valhalla Delay"]
      }
    ]
  },
  {
    name: "Harmonic",
    description: "Add warmth, grit, and character via distortion.",
    icon: "🔥",
    commonTypes: [
      {
        name: "Saturation",
        description: "Subtle analog-style warmth and compression.",
        examples: ["Soundtoys Decapitator", "FabFilter Saturn 2", "Waves Kramer Tape"]
      },
      {
        name: "Exciter",
        description: "Enhance high frequencies using harmonic synthesis.",
        examples: ["Waves Aphex Vintage Exciter", "iZotope Ozone Exciter"]
      }
    ]
  }
];

export const SONIC_GOALS = [
  "Add Punch & Impact",
  "Smooth & Level Vocals",
  "Add Analog Warmth",
  "Create Deep Space",
  "Surgical Frequency Fix",
  "Aggressive Distortion",
  "Mix Glue (Bus Processing)",
  "Mastering Clarity",
  "Creative Modulation",
  "Clean & Professional Vocals"
];
