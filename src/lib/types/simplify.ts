export interface SimplifyData {
  simplified_explanation: string;
  everyday_examples: Array<{
    title: string;
    description: string;
  }>;
  analogies: Array<{
    concept: string;
    analogy: string;
  }>;
  key_takeaways: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
}
