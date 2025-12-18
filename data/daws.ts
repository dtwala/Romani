
import { DAWType } from '../types';

export interface DAWShortcut {
  key: string;
  action: string;
}

export interface DAWSetting {
  name: string;
  value: string;
  description: string;
}

export interface DAWProfile {
  type: DAWType;
  icon: string;
  terminology: string[];
  stockPlugins: string[];
  workflowFocus: string;
  reasoningInjection: string;
  shortcuts: DAWShortcut[];
  recommendedSettings: DAWSetting[];
  mixingPhilosophy: string;
  masteringWorkflow: string;
}

export const DAW_PROFILES: Record<DAWType, DAWProfile> = {
  [DAWType.PRO_TOOLS]: {
    type: DAWType.PRO_TOOLS,
    icon: '🎹',
    terminology: ['Inserts', 'Sends', 'Playlists', 'AudioSuite', 'I/O Setup'],
    stockPlugins: ['EQ7', 'Dyn3 Compressor', 'D-Verb', 'Maxim', 'Lo-Fi', 'Vari-Fi'],
    workflowFocus: 'Linear, hardware-style mixing and meticulous editing.',
    reasoningInjection: 'Prioritize terminology like "Inserts" and "Sends". Suggest standard shortcut-based workflows. Reference AAX plugin architecture and destructive editing where appropriate.',
    shortcuts: [
      { key: 'Cmd + [ / ]', action: 'Zoom In / Out' },
      { key: 'Cmd + Shift + N', action: 'New Track' },
      { key: 'B', action: 'Separate Clip at Cursor' },
      { key: 'Cmd + Option + G', action: 'Group Selected Clips' },
      { key: 'Option + Click', action: 'Reset Parameter to Default' }
    ],
    recommendedSettings: [
      { name: 'Buffer Size', value: '128 / 256 Samples', description: 'Lowest for tracking, highest for heavy mixing.' },
      { name: 'Playback Engine', value: 'Hybrid Engine', description: 'Enable for lower latency on HDX/Silicon systems.' },
      { name: 'Disk Cache', value: 'Normal / Fixed', description: 'Allocate RAM to timeline for smoother playback.' }
    ],
    mixingPhilosophy: 'Mimics the workflow of an SSL or Neve console. Focus on VCA masters, subgrouping (Aux Inputs), and utilizing HEAT for harmonic saturation.',
    masteringWorkflow: 'Utilize Master Faders with dither (POW-r) on the final slot. Use AudioSuite for destructive "baked-in" processing of specific clips.'
  },
  [DAWType.ABLETON_LIVE]: {
    type: DAWType.ABLETON_LIVE,
    icon: '🎛️',
    terminology: ['Session View', 'Arrangement View', 'Device Rack', 'Warping', 'Follow Actions'],
    stockPlugins: ['Glue Compressor', 'EQ Eight', 'Operator', 'Echo', 'Drum Buss', 'Multiband Dynamics'],
    workflowFocus: 'Non-linear composition, clip-based performance, and complex signal chains.',
    reasoningInjection: 'Focus on "Device Racks" and "Macro Controls". Suggest creative warping and non-destructive processing. Reference the specific EQ Eight and Glue Compressor characteristics.',
    shortcuts: [
      { key: 'Cmd + G', action: 'Group Tracks / Devices' },
      { key: 'Cmd + D', action: 'Duplicate Selection' },
      { key: 'Tab', action: 'Switch Session/Arrangement View' },
      { key: '0 (Zero)', action: 'Deactivate Clip/Device' },
      { key: 'Cmd + Option + L', action: 'Show/Hide Detail View' }
    ],
    recommendedSettings: [
      { name: 'Warp Mode', value: 'Complex / Complex Pro', description: 'Best for polyphonic material without artifacts.' },
      { name: 'Plugin Buffer', value: 'As Audio Buffer', description: 'Ensures sync between Live and VST/AU plugins.' },
      { name: 'Phase Invert', value: 'Utility Device', description: 'Use Utility as the first device for phase/mono checks.' }
    ],
    mixingPhilosophy: 'Modular and experimental. Use Effect Racks for parallel processing and Chain Selectors for sound stage management.',
    masteringWorkflow: 'Chain mastering devices on the Master Track. Use "Multiband Dynamics" for transparent level control and "Limiter" for ceiling management.'
  },
  [DAWType.LOGIC_PRO]: {
    type: DAWType.LOGIC_PRO,
    icon: '🍎',
    terminology: ['Smart Controls', 'Environment', 'Live Loops', 'Track Stacks', 'Flex Time'],
    stockPlugins: ['Vintage EQ', 'Compressor (7 models)', 'Alchemy', 'Space Designer', 'ChromaVerb', 'Phat FX'],
    workflowFocus: 'Comprehensive production, from MIDI orchestration to high-end mixing.',
    reasoningInjection: 'Mention "Track Stacks" and "Smart Controls". Reference Logic\'s 7 specific compressor circuit models (Opto, VCA, FET). Suggest using stock Alchemy or Space Designer for spatial depth.',
    shortcuts: [
      { key: 'T', action: 'Open Tool Menu' },
      { key: 'V', action: 'Show/Hide All Plugins' },
      { key: 'G', action: 'Show/Hide Global Tracks' },
      { key: 'Cmd + K', action: 'Musical Typing' },
      { key: 'Cmd + D', action: 'New Track with Duplicate Settings' }
    ],
    recommendedSettings: [
      { name: 'I/O Buffer', value: '32 to 1024', description: 'Match to system load; use 128 for a balanced feel.' },
      { name: 'Process Buffer', value: 'Medium / Large', description: 'Improves stability during high track counts.' },
      { name: 'Sample Rate', value: '48 kHz', description: 'Standard for modern digital production.' }
    ],
    mixingPhilosophy: 'Traditional yet flexible. Utilize Folder Stacks for organization and Summing Stacks for subgroup processing. Use the Mixer\'s "VCA" faders for group leveling.',
    masteringWorkflow: 'Integrate Project Mastering tools. Use "Loudness Meter" to target -14 LUFS for streaming services.'
  },
  [DAWType.FL_STUDIO]: {
    type: DAWType.FL_STUDIO,
    icon: '🍊',
    terminology: ['Piano Roll', 'Step Sequencer', 'Playlist', 'Patcher', 'Mixer Inserts'],
    stockPlugins: ['Fruity Limiter', 'Edison', 'Sytrus', 'Gross Beat', 'Soundgoodizer', 'Patcher'],
    workflowFocus: 'Pattern-based composition and aggressive, modern sound design.',
    reasoningInjection: 'Focus on "Piano Roll" techniques and "Patcher" routing. Suggest using Fruity Limiter for sidechaining and Gross Beat for rhythmic variation. Emphasize pattern-playlist interaction.',
    shortcuts: [
      { key: 'F5', action: 'Show Playlist' },
      { key: 'F7', action: 'Show Piano Roll' },
      { key: 'F9', action: 'Show Mixer' },
      { key: 'Cmd + B', action: 'Paint (Duplicate) Selection' },
      { key: 'Cmd + L', action: 'Link Selected to Mixer Track' }
    ],
    recommendedSettings: [
      { name: 'Audio Device', value: 'FL Studio ASIO', description: 'Best compatibility with Windows audio drivers.' },
      { name: 'Triple Buffer', value: 'On', description: 'Increases stability on CPUs with high core counts.' },
      { name: 'Smoothing', value: 'Fast', description: 'Ensures visual meters are responsive and accurate.' }
    ],
    mixingPhilosophy: 'Routing-heavy. Use "Mixer Track Routing" to create complex sidechain networks. Leverage "Patcher" for multi-band or parallel processing within a single slot.',
    masteringWorkflow: 'Process the "Master" insert. Use "Fruity Soft Clipper" for that classic FL punch and "Maximus" for multi-band mastering.'
  },
  [DAWType.REAPER]: {
    type: DAWType.REAPER,
    icon: '🦅',
    terminology: ['Actions', 'JSFX', 'Take FX', 'Parameter Modulation', 'ReaRoute'],
    stockPlugins: ['ReaEQ', 'ReaComp', 'ReaVerb', 'JS: 1175', 'ReaXcomp'],
    workflowFocus: 'Hyper-customization and ultra-flexible signal routing.',
    reasoningInjection: 'Emphasize "JSFX" and "Parameter Modulation". Suggest custom action-based workflows and Reaper\'s unique "one-track-type-fits-all" logic.',
    shortcuts: [
      { key: 'Cmd + T', action: 'New Track' },
      { key: 'R', action: 'Record' },
      { key: 'Cmd + Shift + M', action: 'Show/Hide Mixer' },
      { key: 'S', action: 'Split Item' },
      { key: 'V / P', action: 'Show Volume / Pan Envelope' }
    ],
    recommendedSettings: [
      { name: 'Disk I/O', value: 'High Performance', description: 'Prevents stuttering on slow mechanical drives.' },
      { name: 'Anticipative FX', value: 'Enabled', description: 'Reaper\'s core tech for massive plugin counts.' },
      { name: 'Rendering', value: 'Full-speed Offline', description: 'Standard for fast, high-quality bounces.' }
    ],
    mixingPhilosophy: 'Folder-based hierarchy. Every track can be a bus. Use "Parameter Modulation" (LFOs/Sidechain) to create breathing mixes without extra plugins.',
    masteringWorkflow: 'Use "Master Track" envelopes for fine-tuning loudness. Utilize "JSFX" limiters for transparent gain reduction.'
  },
  [DAWType.CUBASE]: {
    type: DAWType.CUBASE,
    icon: '🟦',
    terminology: ['Control Room', 'VariAudio', 'Expression Maps', 'MixConsole', 'Chord Track'],
    stockPlugins: ['REVerence', 'Squasher', 'Frequency 2', 'Quadrafuzz', 'Imager', 'SuperVision'],
    workflowFocus: 'Advanced MIDI orchestration and deep audio surgical tools.',
    reasoningInjection: 'Mention "Control Room" for monitoring and "VariAudio" for pitch correction. Suggest using "Squasher" for modern dynamics and "Expression Maps" for complex scoring.',
    shortcuts: [
      { key: 'F3', action: 'Open MixConsole' },
      { key: 'G / H', action: 'Zoom In / Out' },
      { key: 'J', action: 'Toggle Snap' },
      { key: 'F2', action: 'Show Transport Bar' },
      { key: 'Cmd + Alt + E', action: 'Export Audio' }
    ],
    recommendedSettings: [
      { name: 'ASIO-Guard', value: 'High', description: 'Allows for high performance even with low buffer sizes.' },
      { name: 'Control Room', value: 'Active', description: 'Separates monitoring volume from mix volume.' },
      { name: 'Audio Engine', value: '64-bit Float', description: 'Maximum internal resolution for processing.' }
    ],
    mixingPhilosophy: 'Logical and console-like. Utilize "Channel Strip" modules (EQ, Comp, Sat) before adding inserts. Use "VCA Faders" for subgroup control.',
    masteringWorkflow: 'Use the dedicated "Mastering" tab in newer versions. Leverage "Frequency 2" in M/S mode for surgical spectral mastering.'
  },
  [DAWType.STUDIO_ONE]: {
    type: DAWType.STUDIO_ONE,
    icon: '⚡',
    terminology: ['Scratch Pads', 'Pipeline', 'Arranger Track', 'Console Shaper', 'Event FX'],
    stockPlugins: ['Empire', 'Fat Channel', 'Open AIR', 'ProEQ3', 'Binaural Pan', 'RedlightDist'],
    workflowFocus: 'Speed, drag-and-drop workflow, and integrated mastering.',
    reasoningInjection: 'Focus on "Scratch Pads" for arrangement experimentation. Suggest using "Console Shaper" for analog crosstalk emulation and "Pipeline" for hardware integration.',
    shortcuts: [
      { key: 'F3', action: 'Show Mixer' },
      { key: 'F4', action: 'Show Inspector' },
      { key: 'F7', action: 'Show Editor' },
      { key: 'D', action: 'Duplicate Selection' },
      { key: 'Cmd + Option + F', action: 'Find in Browser' }
    ],
    recommendedSettings: [
      { name: 'Dropout Protection', value: 'Maximum', description: 'Enables massive plugin counts without audio glitches.' },
      { name: 'Sample Rate', value: '44.1 / 48 kHz', description: 'Standard for professional audio work.' },
      { name: 'Resolution', value: '32-bit Float', description: 'High precision for all internal audio calculations.' }
    ],
    mixingPhilosophy: 'Drag-and-drop efficiency. Use "Fat Channel" on every track for a consistent analog feel. Utilize "Mix Engine FX" (Console Shaper) on buses for harmonic glue.',
    masteringWorkflow: 'Seamless "Project Page" integration. Mastering project is linked to the Mix project—changes in mix update the master automatically.'
  }
};
