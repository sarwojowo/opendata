import { ethers } from "hardhat";

async function main(): Promise<void> {

  const [deployer] = await ethers.getSigners();

  console.log("====================================");
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("====================================");

  const EscrowFactory = await ethers.getContractFactory("EscrowFactory");

  const factory = await EscrowFactory.deploy();

  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log("✅ EscrowFactory deployed to:", factoryAddress);
  console.log("====================================");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});