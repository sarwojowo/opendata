import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAddress, ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEscrowContract } from "@/lib/contract";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const { escrowAddress, txHash } = await req.json();

    // =========================
    // BASIC VALIDATION
    // =========================
    if (!escrowAddress || !isAddress(escrowAddress)) {
      return NextResponse.json({ message: "Invalid escrow address" }, { status: 400 });
    }

    if (!txHash || !txHash.startsWith("0x")) {
      return NextResponse.json({ message: "Invalid tx hash" }, { status: 400 });
    }

    // =========================
    // GET ORDER
    // =========================
    const order = await prisma.order.findUnique({
      where: { id: BigInt(id)},
      include: {
        user: true,
        service: {
          include: {
            creator: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // =========================
    // AUTHORIZATION
    // =========================
    if (order.user_id !== BigInt(userId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // =========================
    // 🔥 ON-CHAIN VALIDATION
    // =========================
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    // 1. cek contract ada
    const code = await provider.getCode(escrowAddress);

    if (code === "0x") {
      return NextResponse.json(
        { message: "Escrow contract not found" },
        { status: 400 }
      );
    }

    // 2. connect contract
    const contract = getEscrowContract(escrowAddress, provider);

    const clientOnChain = (await contract.client()).toLowerCase();
    const amountOnChain = await contract.amount();

    // 🔥 DEBUG LOG (TARUH DI SINI)
    console.log("escrowAddress:", escrowAddress);
    console.log("clientOnChain:", clientOnChain);
    console.log("dbClient:", order.user.wallet.toLowerCase());
    console.log("amountOnChain:", amountOnChain.toString());
    

    // =========================
    // 🔥 VALIDASI DATA
    // =========================
    if (clientOnChain !== order.user.wallet.toLowerCase()) {
      return NextResponse.json(
        { message: "Client mismatch (invalid escrow)" },
        { status: 400 }
      );
    }

    if (amountOnChain === 0n) {
      console.warn("⚠️ Escrow belum kebaca funded (RPC delay), skip validation");
    }

    // =========================
    // SAVE TO DB
    // =========================
    await prisma.escrow.upsert({
      where: {
        order_id: order.id, // 🔥 pakai ini karena unique
      },
      update: {
        escrow_address: escrowAddress,
        tx_hash: txHash,
        status: "FUNDED",
      },
      create: {
        escrow_address: escrowAddress,
        client_address: order.user.wallet,
        artist_address: order.service.creator.user.wallet,
        arbiter_address: process.env.ARBITER_ADDRESS!,
        amount: order.service.price,
        tx_hash: txHash,
        status: "FUNDED",
        order_id: order.id
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "IN_PROGRESS"
      }
    });

    return NextResponse.json({
      message: "Escrow verified & saved"
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error", error: String(err) },
      { status: 500 }
    );
  }
}