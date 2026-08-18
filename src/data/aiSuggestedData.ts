// Define the type for AI suggestions
export interface AIDescription {
  id: string;
  text: string;
  suggestedFix: string;
}

export const dummySuggestions: AIDescription[] = [
  {
    id: "1",
    text: "Error detected in spelling.",
    suggestedFix: 'Consider correcting the spelling to "color".',
  },
  {
    id: "2",
    text: "Grammar issue identified.",
    suggestedFix: 'Try changing "She don\'t" to "She doesn\'t".',
  },
  {
    id: "3",
    text: "Punctuation error.",
    suggestedFix: 'Add a comma after "however" for better readability.',
  },
];
