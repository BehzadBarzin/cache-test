import { faker } from "@faker-js/faker";
import { prisma } from "./prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

type TSeedFn = (args: {
  users: number;
  articlesPerUser: number;
}) => Promise<void>;

export const seedDatabase: TSeedFn = async ({ users, articlesPerUser }) => {
  console.log("[Initial Seed] Seeding database...");
  // ---------------------------------------------------------------------------
  // Create Users
  const hashedPassword = await bcrypt.hash("Abc123", 10);

  console.log(`[Initial Seed] Creating ${users} users...`);

  const usersCreated: User[] = [];

  for (let i = 0; i < users; i++) {
    try {
      const newUser: User = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: hashedPassword,
        },
      });

      usersCreated.push(newUser);
    } catch (error) {}
  }
  // ---------------------------------------------------------------------------
  // Create Articles
  console.log(
    `[Initial Seed] Creating ${articlesPerUser} articles per user, total: ${
      users * articlesPerUser
    }...`
  );

  for (const user of usersCreated) {
    for (let i = 0; i < articlesPerUser; i++) {
      try {
        await prisma.article.create({
          data: {
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraph(),
            image: faker.image.urlLoremFlickr(),
            userId: user.id,
          },
        });
      } catch (error) {}
    }
  }

  // ---------------------------------------------------------------------------
  console.log("[Initial Seed] Seeding Done.");
};
