import prisma from './prisma';

export async function fetchService(searchQuery?: string): Promise<any> {
    return prisma.service.findMany({
        where: {
            deleted_at:null,
            name: searchQuery ? {
                contains: searchQuery,
                mode: 'insensitive'
            } : undefined
        },
        include:{
            creator:{
                include:{
                    user:true
                }
            }
        }
    });
}

export async function fetchServiceByCreatorId(creatorId: number | bigint): Promise<any> {
    return prisma.service.findMany({
        where: {
            creator_id:creatorId,
            deleted_at:null
        },
        // if want include creator
        // include:{
        //     creator:{
        //         include:{
        //             user:{
        //
        //             }
        //         }
        //     }
        // }
    });
}

export async function fetchServiceById(id: number | bigint): Promise<any> {
    return prisma.service.findFirst({
        where: {
            id: id,
            deleted_at: null,
        },
    })
}

export async function createService(data: any): Promise<any> {
    return await prisma.service.create({
        data: data
    });
}

export async function deleteServiceById(id: number | bigint): Promise<any> {
    return await prisma.service.update({
        where: {
            id: id,
        },
        data: {
            deleted_at: new Date(),
        },
    });
}

export async function updateService(id: number | bigint, data: any): Promise<any> {
    return await prisma.service.update({
        where: {
            id: id,
            deleted_at: null,
        },
        data: data,
    });
}