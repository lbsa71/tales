// Chapter metadata and loading
export interface Chapter {
  id: number;
  title: string;
  filename: string;
  content: string;
  themeColor: string; // Subtle color theme for each chapter
  buttonText?: string; // Optional custom text for the proceed button
}

// Import chapters as raw text
import chapter01 from './chapters/chapter_01_replicators.md?raw';
import chapter02 from './chapters/chapter_02_protocells.md?raw';
import chapter03 from './chapters/chapter_03_rna_organisms.md?raw';
import chapter04 from './chapters/chapter_04_early_cells.md?raw';
import chapter05 from './chapters/chapter_05_multicellular.md?raw';
import chapter06 from './chapters/chapter_06_sentient_animals.md?raw';
import chapter07 from './chapters/chapter_07_humans.md?raw';
import chapter08 from './chapters/chapter_08_the_pattern.md?raw';

export const chapters: Chapter[] = [
  {
    id: 1,
    title: 'Replicators',
    filename: 'chapter_01_replicators.md',
    content: chapter01,
    themeColor: '#1a1408', // Dark gold - chemistry, warmth, primordial
    buttonText: 'dissolve',
  },
  {
    id: 2,
    title: 'Protocells',
    filename: 'chapter_02_protocells.md',
    content: chapter02,
    themeColor: '#0a120e', // Dark cyan-green - first life, boundaries
    buttonText: 'remember',
  },
  {
    id: 3,
    title: 'RNA Organisms',
    filename: 'chapter_03_rna_organisms.md',
    content: chapter03,
    themeColor: '#0e140a', // Dark olive-green - RNA world, replication
    buttonText: 'refine',
  },
  {
    id: 4,
    title: 'Early Cells',
    filename: 'chapter_04_early_cells.md',
    content: chapter04,
    themeColor: '#0a100f', // Dark teal - metabolism, energy
    buttonText: 'surrender',
  },
  {
    id: 5,
    title: 'Multicellular Life',
    filename: 'chapter_05_multicellular.md',
    content: chapter05,
    themeColor: '#0f0a14', // Dark purple - cooperation, complexity
    buttonText: 'choose',
  },
  {
    id: 6,
    title: 'Sentient Animals',
    filename: 'chapter_06_sentient_animals.md',
    content: chapter06,
    themeColor: '#140a0f', // Dark magenta - consciousness, experience
    buttonText: 'imagine',
  },
  {
    id: 7,
    title: 'Humans',
    filename: 'chapter_07_humans.md',
    content: chapter07,
    themeColor: '#0a0e14', // Dark blue - thought, abstraction
    buttonText: 'witness',
  },
  {
    id: 8,
    title: 'The Pattern',
    filename: 'chapter_08_the_pattern.md',
    content: chapter08,
    themeColor: '#0a0a0f', // Original dark - digital, machine
    // No buttonText - this is the last chapter
  },
];

export const getChapter = (id: number): Chapter | undefined => {
  return chapters.find(ch => ch.id === id);
};

export const getTotalChapters = (): number => {
  return chapters.length;
};
