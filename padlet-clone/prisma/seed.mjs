import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.board.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} boards already exist.`);
    return;
  }

  const demo = await prisma.user.create({
    data: { name: "Demo Maker", email: "demo@boardly.local", color: "#f0508c" }
  });

  // Wall: brainstorm
  const wall = await prisma.board.create({
    data: {
      slug: "welcome-wall",
      title: "Welcome to Boardly",
      description: "A friendly wall to get you started. Add a post!",
      format: "wall",
      wallpaper: "bubblegum",
      ownerId: demo.id
    }
  });
  await prisma.post.createMany({
    data: [
      { boardId: wall.id, authorName: "Demo Maker", subject: "Hi there 👋", body: "Click a post to open it. Press the pink + button (or double-click empty space) to add a post.", color: "#ffec99", position: 0 },
      { boardId: wall.id, authorName: "Demo Maker", subject: "Add media", body: "Posts can hold text, an image URL and a link.", color: "#d0ebff", position: 1 },
      { boardId: wall.id, authorName: "Demo Maker", subject: "React & comment", body: "Tap the heart or open a post to comment.", color: "#e5dbff", position: 2 }
    ]
  });

  // Columns: kanban
  const cols = await prisma.board.create({
    data: {
      slug: "project-board",
      title: "Project Board",
      description: "Track work across stages.",
      format: "columns",
      wallpaper: "sand",
      ownerId: demo.id
    }
  });
  const secTitles = ["To do", "Doing", "Done"];
  const sections = [];
  for (let i = 0; i < secTitles.length; i++) {
    sections.push(
      await prisma.section.create({ data: { boardId: cols.id, title: secTitles[i], position: i } })
    );
  }
  await prisma.post.createMany({
    data: [
      { boardId: cols.id, sectionId: sections[0].id, authorName: "Demo Maker", subject: "Kickoff", body: "Define project scope", color: "#ffd8a8", position: 0 },
      { boardId: cols.id, sectionId: sections[1].id, authorName: "Demo Maker", subject: "Design", body: "Draft wireframes", color: "#d0ebff", position: 0 },
      { boardId: cols.id, sectionId: sections[2].id, authorName: "Demo Maker", subject: "Setup", body: "Repo created", color: "#d3f9d8", position: 0 }
    ]
  });

  console.log("Seed complete: demo user + 2 boards.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
