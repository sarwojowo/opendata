import { serializeBigInt } from "@/lib/serializer"
import {getUserByWallet} from "@/lib/user";
import { fetchCreatorByUserId } from "@/lib/CreatorRepository";

export async function GET(
  req: Request,
  context: { params: Promise<{ did: string }> }
) {
  try {
    const { did } = await context.params
    const { searchParams } = new URL(req.url);
    const includeCreatorStatus = searchParams.get('includeCreatorStatus') === 'true';
    
    console.log(did.toLowerCase())
    // const wallet = did.replace("did:ethr:", "")

    const user = await getUserByWallet(did.toLowerCase())

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 })
    }

    const userData = serializeBigInt(user);
    
    // Optionally include creator status if requested
    if (includeCreatorStatus) {
      const creator = await fetchCreatorByUserId(user.id);
      return new Response(
        JSON.stringify({ 
          ...userData, 
          isCreator: !!creator 
        }), 
        { status: 200 }
      );
    }

    return new Response(JSON.stringify(userData), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}