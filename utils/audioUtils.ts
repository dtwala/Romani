
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function calculateDelayTimes(bpm: number) {
  const quarter = 60000 / bpm;
  return {
    whole: quarter * 4,
    half: quarter * 2,
    quarter: quarter,
    eighth: quarter / 2,
    sixteenth: quarter / 4,
    tripletEighth: (quarter * 2) / 3,
    dottedEighth: quarter * 0.75,
  };
}

export function freqToNote(freq: number): string {
  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const h = Math.round(12 * Math.log2(freq / 440));
  const octave = Math.floor((h + 9) / 12) + 4;
  const n = (h + 9) % 12;
  return NOTES[n < 0 ? n + 12 : n] + octave;
}
