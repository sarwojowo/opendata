import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const user1 = await prisma.user.upsert({
        where: { wallet: '0x7945F1e92950a5EC926DE28FFDB8140D98121535' },
        update: {},
        create: {
            name: 'test',
            wallet: '0x7945F1e92950a5EC926DE28FFDB8140D98121535',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { wallet: '0x7945F1e92950a5EC926DE28FFDB8140D98121555' },
        update: {},
        create: {
            name: 'test2',
            wallet: '0x7945F1e92950a5EC926DE28FFDB8140D98121555',
        },
    });

    const creator = await prisma.creator.upsert({
        where: { id: 1 },
        update: {},
        create: {
            user_id: user1.id,
            phone_number: '081232213452',
        },
    });

    const service = await prisma.service.upsert({
        where: { id: 1 },
        update: {},
        create: {
            creator_id: creator.id,
            name: 'Sample Service',
            price: 0,
            image_url: 'https://placeholder.com/image.jpg',
        },
    });

    await prisma.order.upsert({
        where: { id: 1 },
        update: {},
        create: {
            service_id: service.id,
            user_id: user2.id,
            status: 'PENDING_ACCEPTANCE',
            reference_image_url: 'https://placeholder.com/reference.jpg',
            escrow_address: '',
        },
    });

    await prisma.posting.upsert ({
        where: { id : 1},
        update: {},
        create: {
            user_id: user1.id,
            title: 'test',
            likes_count:10,
            image_url: 'https://placeholder.com/image.jpg',
        }
    })

    await prisma.posting.upsert ({
        where: { id : 2},
        update: {},
        create: {
            user_id: user2.id,
            title: 'ByUk',
            likes_count:0,
            image_url: 'https://placeholder.com/image.jpg',
        }
    })

    console.log('Seed selesai ✅');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
