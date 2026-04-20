import { prisma } from "./lib/db";
async function main() {
  const exams = await prisma.customExam.findMany();
  console.log(JSON.stringify(exams.map(e => ({ id: e.id, name: e.name, category: e.category, section: e.section })), null, 2));
}
main();
