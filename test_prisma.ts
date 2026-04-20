import { prisma } from "./lib/db";
async function main() {
  try {
    const newExam = await prisma.customExam.create({
      data: {
        name: "Test Exam",
        durationMinutes: 180,
        maxMarks: 300,
        cardDetails: "3 hours",
        scoringCorrect: 4,
        scoringIncorrect: -1,
        instructions: "[]",
        paletteLegend: "[]",
        baseExamId: "jee",
        isPremium: false,
        category: "Test Cat",
        section: "Test Sec",
        questions: {
          create: [{
            index: 1,
            section: "Math",
            subject: "Math",
            type: "mcq",
            text: "1+1?",
            correctAnswer: "2",
            explanation: "basic math"
          }]
        }
      }
    });
    console.log("Success:", newExam.id);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
