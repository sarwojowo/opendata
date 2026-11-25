import { ethers } from "ethers"

// =========================
// ENV
// =========================
export const RPC_URL = process.env.RPC_URL!
export const FACTORY_ADDRESS = process.env.ESCROW_FACTORY_ADDRESS!
export const ARBITER_ADDRESS = process.env.ARBITER_ADDRESS!

if (!RPC_URL) throw new Error("RPC_URL not set")
if (!FACTORY_ADDRESS) throw new Error("ESCROW_FACTORY_ADDRESS not set")
if (!ARBITER_ADDRESS) throw new Error("ARBITER_ADDRESS not set")

// =========================
// ABI
// =========================
export const FACTORY_ABI = [
  "function createEscrow(address _artist, address _arbiter) returns (address)",
  "event EscrowCreated(address escrow, address client, address artist, address arbiter)"
]

export const ESCROW_ABI = [
  // WRITE
  "function deposit() payable",
  "function startWork()",
  "function submitWork(string)",
  "function approveWork()",
  "function raiseDispute()",
  "function resolveDispute(bool)",
  "function withdraw()",
  "function cancelIfNoResponse()",
  "function cancelIfNotDelivered()",
  "function rejectOrderByArtist(string)",

  // READ
  "function started() view returns (bool)",
  "function client() view returns (address)",
  "function reviewDeadline() view returns (uint256)",
  "function workDeadline() view returns (uint256)",
  "function startDeadline() view returns (uint256)",
  "function status() view returns (uint8)",
  "function amount() view returns (uint256)",
  "function getSubmission() view returns (string,uint256,address)"
]

// =========================
// PROVIDER & SIGNER
// =========================
export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL)
}

export function getSigner() {
  const provider = getProvider()

  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set")
  }

  return new ethers.Wallet(process.env.PRIVATE_KEY, provider)
}

// =========================
// FACTORY INSTANCE
// =========================
export function getFactoryContract(signer?: ethers.Signer) {
  return new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    signer || getSigner()
  )
}

// =========================
// ESCROW INSTANCE
// =========================
export function getEscrowContract(
  address: string,
  providerOrSigner: ethers.Provider | ethers.Signer
) {
  return new ethers.Contract(
    address,
    ESCROW_ABI,
    providerOrSigner
  )
}

// =========================
// 🔥 CREATE ESCROW (SERVER SIDE)
// =========================
export async function createEscrowOnChain(artist: string) {
  const factory = getFactoryContract()

  const tx = await factory.createEscrow(
    artist,
    ARBITER_ADDRESS
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