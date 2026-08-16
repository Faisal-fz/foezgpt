import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

async function onboard() {
    const clerkUser = await currentUser();
    if (!clerkUser) {
       throw new Error("Unauthorized");
    }

    const email = clerkUser.emailAddresses[0].emailAddress;

  return prisma.user.upsert({
    where:{
        clerkId: clerkUser.id,
    },
    create:{
        clerkId: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
    },
    update:{
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
    },
  })
}

export default onboard