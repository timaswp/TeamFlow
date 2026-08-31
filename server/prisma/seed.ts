import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Documented demo password, intentionally obvious so it is not mistaken for a real secret. */
const DEMO_PASSWORD = 'Password123!';

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

async function main(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [alex, maria, john, david] = await Promise.all(
    [
      { name: 'Alex Johnson', email: 'alex@example.com' },
      { name: 'Maria Smith', email: 'maria@example.com' },
      { name: 'John Brown', email: 'john@example.com' },
      { name: 'David Wilson', email: 'david@example.com' },
    ].map((user) => prisma.user.create({ data: { ...user, passwordHash } })),
  );

  if (!alex || !maria || !john || !david) {
    throw new Error('Failed to create demo users');
  }

  const library = await prisma.project.create({
    data: {
      name: 'University Library',
      description: 'University library management application for students and staff.',
      deadline: daysFromNow(50),
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: 'OWNER' },
          { userId: maria.id },
          { userId: john.id },
          { userId: david.id },
        ],
      },
    },
  });

  const shop = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Course project: a small online store with catalogue and cart.',
      deadline: daysFromNow(80),
      ownerId: maria.id,
      members: {
        create: [
          { userId: maria.id, role: 'OWNER' },
          { userId: alex.id },
          { userId: john.id },
        ],
      },
    },
  });

  const campus = await prisma.project.create({
    data: {
      name: 'Smart Campus',
      description: 'IoT dashboard prototype for campus classrooms.',
      deadline: daysFromNow(20),
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: 'OWNER' },
          { userId: david.id },
        ],
      },
    },
  });

  const tasks = [
    {
      projectId: library.id,
      title: 'Implement authentication',
      description: 'Implement JWT authentication and protected routes.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: daysFromNow(3),
      assigneeId: alex.id,
    },
    {
      projectId: library.id,
      title: 'Design database schema',
      description: 'Model books, loans and readers.',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      dueDate: daysFromNow(-6),
      assigneeId: maria.id,
    },
    {
      projectId: library.id,
      title: 'Build book catalogue page',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: daysFromNow(8),
      assigneeId: john.id,
    },
    {
      projectId: library.id,
      title: 'Write documentation',
      status: 'TODO' as const,
      priority: 'LOW' as const,
      dueDate: daysFromNow(14),
      assigneeId: alex.id,
    },
    {
      projectId: library.id,
      title: 'Collect requirements',
      status: 'DONE' as const,
      priority: 'MEDIUM' as const,
      assigneeId: david.id,
    },
    {
      projectId: library.id,
      title: 'Fix overdue loan report',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      dueDate: daysFromNow(-2),
      assigneeId: alex.id,
    },
    {
      projectId: shop.id,
      title: 'Create product API',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: daysFromNow(5),
      assigneeId: maria.id,
    },
    {
      projectId: shop.id,
      title: 'Shopping cart UI',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: daysFromNow(11),
      assigneeId: alex.id,
    },
    {
      projectId: shop.id,
      title: 'Project setup',
      status: 'DONE' as const,
      priority: 'LOW' as const,
      assigneeId: john.id,
    },
    {
      projectId: campus.id,
      title: 'Sensor data ingestion',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: daysFromNow(6),
      assigneeId: david.id,
    },
    {
      projectId: campus.id,
      title: 'Create presentation',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: daysFromNow(12),
      assigneeId: alex.id,
    },
    {
      projectId: campus.id,
      title: 'Wireframes',
      status: 'DONE' as const,
      priority: 'LOW' as const,
      assigneeId: alex.id,
    },
  ];

  const createdTasks = await Promise.all(tasks.map((data) => prisma.task.create({ data })));
  const authTask = createdTasks[0];

  if (authTask) {
    await prisma.comment.createMany({
      data: [
        { taskId: authTask.id, authorId: maria.id, text: 'Should we use JWT or sessions?' },
        { taskId: authTask.id, authorId: alex.id, text: "JWT — I'll implement it today." },
        { taskId: authTask.id, authorId: david.id, text: "Don't forget the protected routes." },
      ],
    });
  }

  console.log(`Seed complete. Demo login: alex@example.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
