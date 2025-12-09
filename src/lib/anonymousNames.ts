// Utility for generating anonymous names for peer mentoring
// Pattern: [Adjective] + [Noun]

const adjectives = [
  "Brave",
  "Peaceful",
  "Clever",
  "Gentle",
  "Wise",
  "Kind",
  "Hopeful",
  "Curious",
  "Bright",
  "Calm",
  "Strong",
  "Swift",
  "Noble",
  "Serene",
  "Bold",
  "Cheerful",
  "Graceful",
  "Humble",
  "Loyal",
  "Patient",
  "Quiet",
  "Radiant",
  "Sincere",
  "Thoughtful",
  "Vibrant",
  "Warm",
  "Zealous",
  "Creative",
  "Friendly",
  "Happy",
  "Joyful",
  "Mindful",
  "Optimistic",
  "Resilient",
  "Steady",
  "Witty",
];

const nouns = [
  "Sparrow",
  "Ocean",
  "Fox",
  "Breeze",
  "Star",
  "Mountain",
  "River",
  "Phoenix",
  "Butterfly",
  "Eagle",
  "Dolphin",
  "Owl",
  "Lotus",
  "Tiger",
  "Deer",
  "Cloud",
  "Horizon",
  "Sunbeam",
  "Moonlight",
  "Thunder",
  "Rainbow",
  "Falcon",
  "Bear",
  "Wolf",
  "Hawk",
  "Swan",
  "Panda",
  "Lotus",
  "Jasmine",
  "Cedar",
  "Maple",
  "Willow",
  "Orchid",
  "Coral",
  "Pearl",
  "Diamond",
];

/**
 * Generate a random anonymous name
 * @returns A unique anonymous name like "Brave Sparrow"
 */
export function generateAnonymousName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

/**
 * Generate a unique anonymous name that doesn't conflict with existing names
 * @param existingNames Array of names already in use
 * @param maxAttempts Maximum number of generation attempts
 * @returns A unique anonymous name
 */
export function generateUniqueAnonymousName(
  existingNames: string[],
  maxAttempts: number = 50
): string {
  for (let i = 0; i < maxAttempts; i++) {
    const name = generateAnonymousName();
    if (!existingNames.includes(name)) {
      return name;
    }
  }

  // Fallback: append a number to ensure uniqueness
  const baseName = generateAnonymousName();
  let counter = 1;
  let uniqueName = `${baseName} ${counter}`;

  while (existingNames.includes(uniqueName)) {
    counter++;
    uniqueName = `${baseName} ${counter}`;
  }

  return uniqueName;
}

/**
 * Validate anonymous name format
 * @param name The name to validate
 * @returns True if valid, false otherwise
 */
export function isValidAnonymousName(name: string): boolean {
  if (!name || typeof name !== "string") return false;

  const parts = name.trim().split(" ");
  if (parts.length < 2) return false;

  // Check if first part is an adjective and second is a noun
  const hasValidAdjective = adjectives.includes(parts[0]);
  const hasValidNoun = nouns.includes(parts[1]);

  return hasValidAdjective && hasValidNoun;
}
