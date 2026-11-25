import prisma from './prisma'

// create order
export async function createOrder(data: any) {
  return await prisma.order.create({
    data,
  });
}

// 🔥 get semua order milik user
export async function fetchOrderByUserId(userId: bigint) {
  return await prisma.order.findMany({
    where: {
      user_id: userId,
    },
    include: {
      service: {
        include: {
          creator: {
            include: {
              user: true,
            },
          },
        },
      },
      escrow: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

// 🔥 get order detail
export async function fetchOrderById(id: bigint) {
  return prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      service: true,
      escrow: true,
      user: true,
    },
  });
}