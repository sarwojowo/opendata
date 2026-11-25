import AddOrUpdateServicesPage from "@/app/(user)/dashboard/services/AddOrUpdateServicePage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function UpdateServicePage({ params }: PageProps) {
    const { id } = await params;

    return <AddOrUpdateServicesPage
        isCreate={false}
        id={id}
    />
}