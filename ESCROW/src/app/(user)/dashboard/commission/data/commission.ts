export type Commission = {
  escrowAddress: string
  title: string
  description: string,
  image: string
  client: string
  freelancer: string
  amount: number
  deadline: string
  status: "In Progress" | "Review" | "Dispute" | "Completed"
  submission?: string
}

export const commissions: Commission[] = [
  {
    escrowAddress: "0x123abc",
    title: "Anime Headshot",
    description: "string",
    image: "https://gateway.pinata.cloud/ipfs/QmXNzEyn4kX1PoJtqj63WcNGsJq2NTEmRJa8LJgUe2HEVA",
    client: "0x123asd",
    freelancer: "0x123abc",
    amount: 1,
    deadline: "2026-03-20",
    status: "Review",
  },
  {
    escrowAddress: "0x123asd",
    title: "Kanguru",
    description: "string",
    image: "https://gateway.pinata.cloud/ipfs/QmXNzEyn4kX1PoJtqj63WcNGsJq2NTEmRJa8LJgUe2HEVA",
    client: "0x123abc",
    freelancer: "0x123asd",
    amount: 5,
    deadline: "2026-03-20",
    status: "Completed",
  },
]