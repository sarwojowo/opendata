import { Skeleton } from "../ui/skeleton";

export default function SkeletonProduct() {
    return (
        <>
            <div className="space-y-2 lg:space-y-7">
                <Skeleton className="rounded-lg lg:rounded-3xl w-full aspect-square" />
                <Skeleton className="w-1/2 h-6 lg:h-20" />
                <Skeleton className="w-full h-10 lg:h-24" />
            </div>
        </>
    );
}