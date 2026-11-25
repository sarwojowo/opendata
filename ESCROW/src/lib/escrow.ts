import { ethers } from "ethers";

// ABI factory (simplified)
const factoryAbi = [
  "function createEscrow(address artist, address arbiter) public returns (address)"
];

export async function createEscrowOnChain(artist: string) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

  const factory = new ethers.Contract(
    process.env.ESCROW_FACTORY_ADDRESS!,
    factoryAbi,
    wallet
  )

  const tx = await factory.createEscrow(
    artist,
    process.env.ARBITER_ADDRESS
  )

  const receipt = await tx.wait()

  let escrowAddress = ""

  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log)
      if (parsed?.name === "EscrowCreated") {
        escrowAddress = parsed.args[0]
      }
    } catch {}
  }

  if (!escrowAddress) {
    throw new Error("Escrow not found")
  }

  return {
    escrowAddress,
    txHash: tx.hash,
  }
}