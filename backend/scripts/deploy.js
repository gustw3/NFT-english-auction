const hre = require("hardhat");

async function main() {

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy("0xC37D8D7762aedd046854A5E1509703C4fcD4619B", 1, 1000000000000000);

  await auction.deployed();

  console.log(
    `Contract deployed to ${auction.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
