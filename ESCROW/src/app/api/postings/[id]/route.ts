import {NextResponse} from "next/server";
import {deletePosting, deletePostingAndLike} from "@/lib/PostingRepository";
import {fetchLikeByPostingId} from "@/lib/LikeRepository";
import {serializeBigInt} from "@/lib/serializer";

export async function DELETE(request: Request, {params}:{ params:Promise <{ id: string }> }):Promise<NextResponse> {
    try{
        const { id } = await params;
        const like = await fetchLikeByPostingId(parseInt(id))
        let del;
        if (!like) {
            del = await deletePosting(parseInt(id))
        }
        else{
            del = await deletePostingAndLike(parseInt(id))
        }
        return NextResponse.json({success: true, message: "Post deleted successfully", data: serializeBigInt(del)}, {status: 200});
    }catch(err){
        return NextResponse.json({success: false, message: "Failed to delete posting", error: String(err)}, {status: 500});
    }
}