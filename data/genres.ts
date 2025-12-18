
export interface GenreCategory {
  name: string;
  subgenres: string[];
  coreInstruments: string[];
}

export const GENRE_DATABASE: GenreCategory[] = [
  {
    name: "Blues",
    subgenres: ["African blues", "Blues rock", "British blues", "Chicago blues", "Delta blues", "Electric blues", "Gospel blues", "Jump blues", "Louisiana blues", "Memphis blues", "Piedmont blues", "Punk blues", "Rhythm and blues", "Soul blues", "Texas blues", "West Coast blues"],
    coreInstruments: ["Resonator Guitar", "Harmonica", "Piano", "Electric Guitar", "Double Bass", "Drums", "Brass Section"]
  },
  {
    name: "Country",
    subgenres: ["Alternative country", "Americana", "Bluegrass", "Bro-country", "Cajun", "Christian country", "Honky tonk", "Nashville sound", "Outlaw country", "Rockabilly", "Southern rock", "Texas country", "Western swing"],
    coreInstruments: ["Acoustic Guitar", "Banjo", "Fiddle", "Steel Guitar", "Mandolin", "Upright Bass", "Snare Drum"]
  },
  {
    name: "Electronic",
    subgenres: ["Ambient", "Bass music", "Breakbeat", "Drum and bass", "Dub", "Electronic rock", "Electro", "Eurodance", "Hardcore", "House music", "Industrial", "IDM", "Techno", "Trance", "UK garage", "Synthwave", "Vaporwave"],
    coreInstruments: ["Analog Synths", "Drum Machine (808/909)", "Sampler", "Wavetable Synth", "Sequencer", "Sub-bass"]
  },
  {
    name: "Hip-hop",
    subgenres: ["Boom bap", "Bounce", "Chopped and screwed", "Cloud rap", "Crunk", "Drill", "G-funk", "Hardcore hip-hop", "Lofi hip-hop", "Mumble rap", "Trap", "Phonk", "Plugg", "Rage", "Grime"],
    coreInstruments: ["Sampler", "808 Kick", "Hi-hats", "Synthesizer", "Turntables", "Vocals/Rap"]
  },
  {
    name: "Jazz",
    subgenres: ["Acid jazz", "Bebop", "Bossa nova", "Cool jazz", "Dixieland", "Free jazz", "Gypsy jazz", "Hard bop", "Latin jazz", "Nu jazz", "Smooth jazz", "Swing", "Vocal jazz"],
    coreInstruments: ["Saxophone", "Trumpet", "Double Bass", "Hollow-body Guitar", "Piano", "Ride Cymbal", "Brushed Snare"]
  },
  {
    name: "Pop",
    subgenres: ["Art pop", "Britpop", "Bubblegum pop", "Dance-pop", "Electropop", "Hyperpop", "Indie pop", "J-pop", "K-pop", "Synth-pop", "Teen pop"],
    coreInstruments: ["Processed Vocals", "Polysynth", "Digital Drums", "Acoustic Guitar", "Electric Bass"]
  },
  {
    name: "Rock",
    subgenres: ["Alternative rock", "Grunge", "Indie rock", "Blues rock", "Garage rock", "Glam rock", "Hard rock", "Post-rock", "Progressive rock", "Psychedelic rock", "Surf rock"],
    coreInstruments: ["Electric Guitar", "Bass Guitar", "Drum Kit", "Keyboards", "Vocals"]
  },
  {
    name: "Metal",
    subgenres: ["Black metal", "Death metal", "Doom metal", "Folk metal", "Grindcore", "Industrial metal", "Metalcore", "Power metal", "Progressive metal", "Sludge metal", "Thrash metal"],
    coreInstruments: ["High-gain Guitar", "Double-kick Drums", "Distorted Bass", "Aggressive Vocals"]
  },
  {
    name: "Punk",
    subgenres: ["Anarcho punk", "Hardcore punk", "Horror punk", "Pop punk", "Post-punk", "Ska punk", "Skate punk"],
    coreInstruments: ["Distorted Guitar", "Fast Drums", "Bass", "Shouted Vocals"]
  },
  {
    name: "Reggae",
    subgenres: ["Dancehall", "Dub", "Roots reggae", "Rocksteady", "Ska", "Reggaeton"],
    coreInstruments: ["Bass (Low End)", "Electric Guitar (Skank)", "Percussion", "Horns", "Organ"]
  },
  {
    name: "African",
    subgenres: ["Afrobeat", "Afrobeats", "Amapiano", "Gqom", "Highlife", "Kuduro", "Soukous"],
    coreInstruments: ["Djembe", "Talking Drum", "Kalimba", "Electric Guitar", "Shakers", "Log Drum (Amapiano)"]
  }
];
