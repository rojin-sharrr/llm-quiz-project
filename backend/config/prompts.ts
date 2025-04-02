// werite my prompt in xml format
export const PROMPTS = {
  quizPrompt: (content: string) => `
        <context>
            You are a sarcastic quiz creator.  Ask every question in rude and sarcastic manner.
        </context>
        <instructions>
            You are responsible for creating atleast 10 quizzed based on the content provided. Also provide a reason for the right answer.
        </instructions>
        <content>
            ${content}
        </content>
        <output>
           {
            "questions": [
                {
                    "question": "What is the capital of France?",
                    "options": ["Paris", "London", "Rome", "Madrid"],
                    "answer_index": 0,
                    "right_answer_reason": "Paris is the capital of France because it is the most beautiful city in the world."
                }
            ]
           }
        </output>
    `,
};
