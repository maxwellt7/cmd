export type StackType = "gratitude" | "idea" | "discover" | "angry";
export type Core4Domain = "mind" | "body" | "being" | "balance";

export interface StackQuestions {
  questions: string[];
  totalQuestions: number;
}

// ---------------------------------------------------------------------------
// Question flows – copied verbatim from the Sovereignty app
// ---------------------------------------------------------------------------

const GRATITUDE_QUESTIONS: string[] = [
  "What are you going to title this Gratitude Stack?",
  "What domain of CORE 4 are you Stacking? (Mind, Body, Being, or Balance)",
  "Who/What are you stacking?",
  "In this moment, why has [X] triggered you to feel grateful?",
  "What is the story you're telling yourself, created by this trigger, about [X] and the situation?",
  "Describe the single word feelings that arise for you when you tell yourself that story.",
  "Describe the specific thoughts and actions that arise for you when you tell yourself this story.",
  "What are the non-emotional FACTS about the situation with [X] that triggered you to feel grateful?",
  "Empowered by your gratitude trigger with [X] and the original story you are telling yourself, what do you truly want for you in and beyond this situation?",
  "What do you want for [X] in and beyond this situation?",
  "What do you want for [X] and YOU in and beyond this situation?",
  "Stepping back from what you have created so far, why has this gratitude trigger been extremely positive?",
  "Looking at how positive this gratitude trigger has been, what is the singular lesson on life you are taking from this Stack?",
  "What is the most significant REVELATION or INSIGHT you are leaving this Gratitude Stack with, and why do you feel that way?",
  "What immediate ACTIONS are you committed to taking leaving this Stack?",
];

const IDEA_QUESTIONS: string[] = [
  "What are you going to title this Idea Stack?",
  "What domain of CORE 4 are you Stacking? (Mind, Body, Being, or Balance)",
  "Who/What are you stacking?",
  "In this moment, what Idea has [X] activated in you?",
  "What is the story you're telling yourself about this new idea?",
  "Describe the single word feelings that arise for you when you tell yourself that story.",
  "Describe the specific thoughts and actions that arise for you when you tell yourself this story.",
  "If this productive idea is executed on, what are the positive benefits to your world and those you are connected to?",
  "If this productive idea is not executed on, what are the possible negative side effects to your world and those you are connected to?",
  "What is the first measurable FACT?",
  "Why do you feel selecting this FACT is significant?",
  "What is a simple TITLE you could give this FACT?",
  "What is the second measurable FACT?",
  "Why do you feel selecting this FACT is significant?",
  "What is a simple TITLE you could give this FACT?",
  "What is the third measurable FACT?",
  "Why do you feel selecting this FACT is significant?",
  "What is a simple TITLE you could give this FACT?",
  "What is the fourth measurable FACT?",
  "Why do you feel selecting this FACT is significant?",
  "What is a simple TITLE you could give this FACT?",
  "Stepping back from this Idea Stack, why has this productive idea been extremely positive?",
  "Looking at how positive this productive idea has been, what is the singular lesson about life you are taking from this Stack?",
  "What is the most significant REVELATION or INSIGHT you are leaving this Idea Stack with, and why do you feel that way?",
  "What immediate actions are you committed to taking leaving this Stack?",
];

const DISCOVER_QUESTIONS: string[] = [
  "What are you going to title this Discover Stack?",
  "What domain of CORE 4 are you Stacking? (Mind, Body, Being, or Balance)",
  "Who/What are you stacking?",
  "In this moment, what Discovery has [X] activated in you?",
  "What is the story you're telling yourself about this discovery?",
  "Describe the single word feelings that arise for you when you tell yourself that story.",
  "Describe the specific thoughts and actions that arise for you when you tell yourself this story.",
  "Stepping back from what you have discovered, why has this discovery been extremely positive?",
  "Looking at how positive this discovery trigger has been, what is the singular lesson about life you are taking from this Stack?",
  "What Category of life would you like to apply this discovery?",
  "The lesson you learned was: [fill in based on your previous answer]",
  "How does this lesson apply to your chosen CORE 4 domain?",
  "What is the most significant REVELATION, or INSIGHT, that you are leaving this Discover Stack with? Why do you feel that way?",
  "What immediate actions are you committed to taking leaving this Discover Stack?",
];

const ANGRY_QUESTIONS: string[] = [
  "What are you going to title this Angry Stack?",
  "What domain of CORE 4 are you Stacking? (Mind, Body, Being, or Balance)",
  "Who/What are you stacking?",
  "In this moment, why has [X] triggered you to feel anger?",
  "What is the story you're telling yourself, created by this trigger, about [X] and the situation?",
  "Describe the single word feelings that arise for you when you tell yourself that story.",
  "Describe the specific thoughts and actions that arise for you when you tell yourself this story.",
  "What evidence do you have to support this story as absolutely true?",
  "What are the non-emotional facts about the situation with [X] that triggered you to feel anger?",
  "Regardless of your anger trigger with [X] and the original story you are telling yourself, what do you truly want for you in and beyond this situation?",
  "What do you want for [X] in and beyond this situation?",
  "What do you want for [X] and YOU in and beyond this situation?",
  "If you keep telling yourself this original story, will it ultimately give you what you want?",
  "Are you ready to let go of the original story, to expand your mind and reality around this trigger and create a new power story that will assure you get what you want?",
  "Letting go of the original story and reviewing what you want, and knowing you can ultimately create any story you desire — what is your new DESIRED VERSION of the story?",
  "What evidence can you see to prove this DESIRED STORY is accurate, so you can weaponize yourself to move forward today?",
  "Stepping back and reviewing what you want, will telling yourself this desired story give you what you want?",
  "Stepping back from what you have created so far, why has this anger trigger been extremely positive?",
  "Looking at how positive this anger trigger has been, what is the singular lesson on life you are taking from this Stack?",
  "What is the most significant revelation or insight you are leaving this Angry Stack with, and why do you feel that way?",
  "Compared to how you felt when you started this Angry Stack, what singular words would you use to describe how you feel now completing it?",
  "What immediate actions are you committed to taking leaving this Stack?",
];

// ---------------------------------------------------------------------------
// Lookup map
// ---------------------------------------------------------------------------

export const STACK_QUESTIONS: Record<StackType, StackQuestions> = {
  gratitude: { questions: GRATITUDE_QUESTIONS, totalQuestions: GRATITUDE_QUESTIONS.length },
  idea: { questions: IDEA_QUESTIONS, totalQuestions: IDEA_QUESTIONS.length },
  discover: { questions: DISCOVER_QUESTIONS, totalQuestions: DISCOVER_QUESTIONS.length },
  angry: { questions: ANGRY_QUESTIONS, totalQuestions: ANGRY_QUESTIONS.length },
};

// ---------------------------------------------------------------------------
// Helper data
// ---------------------------------------------------------------------------

export const STACK_COLORS: Record<StackType, string> = {
  gratitude: "emerald",
  idea: "blue",
  discover: "violet",
  angry: "red",
};

export const STACK_DESCRIPTIONS: Record<StackType, string> = {
  gratitude: "Transform gratitude triggers into powerful stories and actionable insights.",
  idea: "Capture and develop productive ideas with measurable facts and clear actions.",
  discover: "Process new discoveries and apply the lessons across your life domains.",
  angry: "Reframe anger triggers into desired stories that move you toward what you want.",
};

export const DOMAIN_COLORS: Record<Core4Domain, string> = {
  mind: "blue",
  body: "emerald",
  being: "violet",
  balance: "amber",
};

/**
 * Return the question text for a given stack type and index,
 * replacing [X] with the subject entity name.
 */
export function getQuestion(
  stackType: StackType,
  questionIndex: number,
  subjectEntity: string | null,
): string | null {
  const flow = STACK_QUESTIONS[stackType];
  if (questionIndex < 0 || questionIndex >= flow.totalQuestions) return null;
  let text = flow.questions[questionIndex]!;
  if (subjectEntity) {
    text = text.replace(/\[X\]/g, subjectEntity);
  }
  return text;
}
