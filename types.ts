
export enum ToolType {
  CALCULATOR = 'CALCULATOR',
  LIVE_ASSISTANT = 'LIVE_ASSISTANT',
  ENGINEERING_CHAT = 'ENGINEERING_CHAT',
  ANALYZER = 'ANALYZER',
  PRESETS = 'PRESETS',
  MASTERCLASS = 'MASTERCLASS',
  PATTERN_LAB = 'PATTERN_LAB',
  SIGNAL_FLOW = 'SIGNAL_FLOW',
  DYNAMICS_CONSULTANT = 'DYNAMICS_CONSULTANT',
  HARMONIC_CONSULTANT = 'HARMONIC_CONSULTANT',
  SPATIAL_CONSULTANT = 'SPATIAL_CONSULTANT',
  INSTRUMENT_DATABASE = 'INSTRUMENT_DATABASE',
  VOCAL_BOOTH = 'VOCAL_BOOTH',
  PLUGIN_ADVISOR = 'PLUGIN_ADVISOR',
  STUDIO_SETUP = 'STUDIO_SETUP'
}

export enum DAWType {
  PRO_TOOLS = 'Pro Tools',
  ABLETON_LIVE = 'Ableton Live',
  LOGIC_PRO = 'Logic Pro',
  FL_STUDIO = 'FL Studio',
  REAPER = 'Reaper',
  CUBASE = 'Cubase',
  STUDIO_ONE = 'Studio One'
}

export interface CalculationResult {
  title: string;
  value: string;
  unit: string;
}

export interface TranscriptionMessage {
  text: string;
  role: 'user' | 'assistant';
}

export interface Preset {
  id: string;
  name: string;
  genre: string;
  type: 'Mixing' | 'Mastering';
  params: {
    eq: string;
    compression: string;
    reverb: string;
    special: string;
  };
  notes: string;
}

export interface SelectedGenre {
  cat: string;
  sub: string;
}

export interface InstrumentSpec {
  name: string;
  category: string;
  fundamental: string;
  roleInGenre: string;
  eqSweetSpots: { range: string; effect: string }[];
  problemRanges: { range: string; effect: string }[];
  compression: { ratio: string; attack: string; release: string; notes: string };
  stereoField: {
    panning: string;
    width: string;
    positioningAdvice: string;
  };
  stereoStrategy: string;
  harmonicProfile: string;
  transientProfile: {
    attack: string;
    sustain: string;
    decayNotes: string;
  };
  genreUtility: {
    genre: string;
    role: string;
  }[];
}
