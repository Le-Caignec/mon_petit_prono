const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Oracle', function () {
  async function deployTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners()
    const contract = await ethers.getContractFactory('GetOracleInfo')
    const deployedContract = await contract.deploy()
    return { deployedContract, owner, otherAccount }
  }
  describe('Test Oracle ', function () {
    it('function get', async function () {
      const { deployedContract, owner } = await loadFixture(deployTokenFixture)
      const tab = await deployedContract.get()
      expect(tab[1].toNumber()).to.equal(0)
    })
  })
})
