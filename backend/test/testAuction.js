const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {time} = require("@nomicfoundation/hardhat-network-helpers");


describe('Tests Auction', function () {
  let contractErc721;
  let contractAuction;
  let nft;
  let owner;
  let user

  before(async function () {
      [owner, user, user2, user3, user4] = await ethers.getSigners();
      const ContractErc721 = await ethers.getContractFactory('Diamond');
      contractErc721 = await ContractErc721.deploy();
      nft = await contractErc721.mint({value: "1000000000000000"});
      const ContractAuction = await ethers.getContractFactory('Auction');
      contractAuction = await ContractAuction.deploy(contractErc721.address, 1, 1000000000000000);
  });


    it("it shouldn't end the auction if not started", async function () {
      await expect(contractAuction.end()).to.be.revertedWith('not started');
    })

    it("it shouldn't start if the msg.sender is not the seller", async function () {
      await expect(contractAuction.connect(user).start()).to.be.revertedWith("not seller");
      await expect(await contractAuction.started()).to.equal(false);
    })

    it("it shouldn't start if the contract don't own the nftId", async function () {
      console.log(ethers.utils.formatEther(await contractAuction.highestBid()));
      await expect(contractAuction.start()).to.be.revertedWith("ERC721: caller is not token owner or approved");
      await expect(await contractAuction.started()).to.equal(false);
    })

    it("it shouldn't accept bid if the auction didn't start", async function () {
      const signer = await ethers.getSigner(user.address);
      const contractAuctionInstance = contractAuction.connect(user)
      await expect(contractAuctionInstance.bid({value: "100000000000000000" })).to.be.revertedWith("not started");
    })

    it("it should start the auction and emit an event", async function () {
      await contractErc721.connect(owner).approve(contractAuction.address, 1);
      await expect(contractAuction.start()).to.emit(contractAuction, "Start");
      const state = await contractAuction.started();
      expect(state).to.equal(true);
      let timestamp = parseInt(await contractAuction.endAt());
      let newDate = new Date(timestamp)
      console.log(newDate);
    })

    it("it should be the owner of the token 1 if started", async function () {
      let owner = await contractErc721.ownerOf(1);
      const state = await contractAuction.started();
      expect(state).to.equal(true);
      expect(owner).to.equal(contractAuction.address);
    })

    it("it shouldn't start the auction if already started", async function () {
        await expect(contractAuction.start()).to.be.revertedWith("started")
    })

    it("it should accept the offer if it is superior to the previous one", async function () {
      await contractAuction.connect(user).bid({value: "200000000000000000"});
      expect(await contractAuction.highestBid()).to.equal("200000000000000000");

    })

    it("it should map the highest bidder and his bid", async function () {
      await contractAuction.connect(user2).bid({value: "800000000000000000"});
      expect(await contractAuction.bids(user.address)).to.equal("200000000000000000");
    })

    it("it should store the highest bidder and his bid", async function () {
      expect(await contractAuction.highestBid()).to.equal("800000000000000000");
      expect(await contractAuction.highestBidder()).to.equal((user2.address));
    })

    it("it should emit an event on new bid", async function () {
      await expect(contractAuction.connect(user3).bid({value: "900000000000000000"})).to.emit(contractAuction, "Bid");
    })

    it("it shouldn't end if the auction is not ended", async function () {
      await expect(contractAuction.end()).to.be.revertedWith('not ended');
    })

    it("it shouldn't bid if the auction ended", async function () {
      let date = await time.increase(60);
      await expect(contractAuction.bid({value: "700000000000000000" })).to.be.revertedWith("ended")
    })

    it("it shouldn't withdraw if no bid", async function () {
      await expect(contractAuction.connect(user4).withdraw()).to.be.revertedWith("No bid");
    })

    it("it should withdraw funds if condition meet", async function () {
      await contractAuction.connect(user2).withdraw();
      await expect(await contractAuction.bids(user2.address)).to.equal(0);
    })

    it("it should emit an event on new bid withdraw", async function () {
      await expect(contractAuction.connect(user).withdraw()).to.emit(contractAuction, "Withdraw");
    })

    it("it should end the auction", async function () {
      await contractAuction.end();
      expect(await contractAuction.ended()).to.equal(true);
    })

    it("it should transfer the NFT to the highest bider", async function () {
      const highestBidder = await contractAuction.highestBidder();
      await expect(await contractErc721.ownerOf(1)).to.equal(highestBidder);
    })

    it("it should transfer the highest bid to the seller", async function () {
      const contractBalance = await contractAuction.provider.getBalance(contractAuction.address);
      await expect(contractBalance).to.equal(0);

    })
})


describe('Tests Auction No demand', function () {
  let contractErc721;
  let contractAuction;
  let nft;
  let owner;
  let user

  before(async function () {
      [owner, user, user2, user3, user4] = await ethers.getSigners();
      const ContractErc721 = await ethers.getContractFactory('Diamond');
      contractErc721 = await ContractErc721.deploy();
      nft = await contractErc721.mint({value: "1000000000000000"});
      const ContractAuction = await ethers.getContractFactory('Auction');
      contractAuction = await ContractAuction.deploy(contractErc721.address, 1, 1);
  });


  it("should transfer the nft to the seller if no offer", async function () {
    await contractErc721.connect(owner).approve(contractAuction.address, 1);
    await expect(contractAuction.start()).to.emit(contractAuction, "Start");
    await time.increase(60);
    await contractAuction.end();
    await expect(await contractErc721.ownerOf(1)).to.equal(owner.address);
  })
})
