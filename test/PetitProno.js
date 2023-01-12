const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Mon petit prono', function () {
  async function deployTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners()
    const contract = await ethers.getContractFactory('PetitProno')
    const deployedContract = await contract.deploy()
    return { deployedContract, owner, otherAccount }
  }
  describe('Test deployment ', function () {
    it('Should set right owner', async function () {
      const { deployedContract, owner } = await loadFixture(deployTokenFixture)
      expect(await deployedContract.owner()).to.equal(owner.address)
    })
  })

  describe('League Functions', function () {
    async function LeagueFeature() {
      const { deployedContract } = await loadFixture(deployTokenFixture)
      await deployedContract.addLeague(
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      )
      const leaguesID = await deployedContract.getLeaguesID()
      return { leaguesID, deployedContract }
    }
    it('Verify getLeaguesID', async function () {
      const { leaguesID } = await loadFixture(LeagueFeature)
      expect(leaguesID[0]).to.equal('0x1')
    })
    it('Verify getLeagueById', async function () {
      const { leaguesID, deployedContract } = await loadFixture(LeagueFeature)
      const OneLeague = await deployedContract.getLeagueById(leaguesID[0])
      expect(OneLeague).to.deep.equal([
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      ])
    })
  })

  describe('Team Set Up', function () {
    async function TeamFeature() {
      const { deployedContract } = await loadFixture(deployTokenFixture)
      await deployedContract.addLeague(
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      )
      const leaguesID = await deployedContract.getLeaguesID()
      await deployedContract.addTeam(
        leaguesID[0],
        '1x1',
        'adoption Team',
        'robin',
        'https://ipfs_link',
      )
      await deployedContract.addTeam(
        leaguesID[0],
        '1x2',
        'compagny Team',
        'robin',
        'https://ipfs_link',
      )
      const TeamsIdFromOneLeague = await deployedContract.getTeamsIdFromOneLeague(
        leaguesID[0],
      )
      return { deployedContract, leaguesID, TeamsIdFromOneLeague }
    }
    it('Verify getTeamsIdFromOneLeague', async function () {
      const { TeamsIdFromOneLeague } = await loadFixture(TeamFeature)
      expect(TeamsIdFromOneLeague).to.deep.equal(['1x1', '1x2'])
    })
    it('Verify getTeamsInfos', async function () {
      const {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
      } = await loadFixture(TeamFeature)
      const TeamsInfos = await deployedContract.getTeamsInfos(
        leaguesID[0],
        TeamsIdFromOneLeague[0],
      )
      expect(TeamsInfos).to.deep.equal([
        '1x1',
        'adoption Team',
        'https://ipfs_link',
      ])
    })
  })

  describe('Team Functions', function () {
    async function PlayerFeature() {
      const { deployedContract } = await loadFixture(deployTokenFixture)
      const signer2 = await ethers.getSigner(
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      )
      const signer3 = await ethers.getSigner(
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      )
      await deployedContract.addLeague(
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      )
      const leaguesID = await deployedContract.getLeaguesID()
      await deployedContract.addTeam(
        leaguesID[0],
        '1x1',
        'adoption Team',
        'robin',
        'https://ipfs_link',
      )
      await deployedContract
        .connect(signer2)
        .addTeam(leaguesID[0], '1x2', 'Team1', 'paul', 'https://ipfs_link')
      await deployedContract
        .connect(signer2)
        .addTeam(leaguesID[0], '1x3', 'Team2', 'paul', 'https://ipfs_link')
      const TeamsIdFromOneLeague = await deployedContract.getTeamsIdFromOneLeague(
        leaguesID[0],
      )
      return {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        signer2,
      }
    }
    it('Verify getMyTeamFromOneLeague', async function () {
      const { deployedContract, leaguesID } = await loadFixture(PlayerFeature)
      const myTeam = await deployedContract.getMyTeamFromOneLeague(leaguesID[0])
      expect(myTeam).to.deep.equal(['1x1'])
    })
    it('Verify getFreeTeamFromOneLeague', async function () {
      const { deployedContract, leaguesID, signer2 } = await loadFixture(
        PlayerFeature,
      )
      const myTeam = await deployedContract
        .connect(signer2)
        .getFreeTeamFromOneLeague(leaguesID[0])
      expect(myTeam).to.deep.equal(['1x1'])
    })
  })

  describe('Players Functions', function () {
    function getDate(str) {
      const [dateComponents, timeComponents] = str.split(' ')
      const [month, day, year] = dateComponents.split('/')
      const [hours, minutes, seconds] = timeComponents.split(':')
      const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds)
      const timestamp = Math.trunc(date.getTime() / 1000)
      return timestamp
    }

    async function PlayerFeature() {
      const { deployedContract } = await loadFixture(deployTokenFixture)
      await deployedContract.addLeague(
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      )
      const leaguesID = await deployedContract.getLeaguesID()
      await deployedContract.addTeam(
        leaguesID[0],
        '1x1',
        'adoption Team',
        'robin',
        'https://ipfs_link',
      )
      const TeamsIdFromOneLeague = (
        await deployedContract.getTeamsIdFromOneLeague(leaguesID[0])
      )[0]
      const timestamp = getDate('11/08/2023 21:28:9')
      await deployedContract.addForecast(
        leaguesID[0],
        '2x1',
        ['France', 'Allemagne'],
        timestamp,
      )
      const forecastId = await deployedContract.getForecastId(
        leaguesID[0],
        TeamsIdFromOneLeague,
      )
      return {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        forecastId,
        timestamp,
      }
    }
    it('Verify addForecast', async function () {
      const { forecastId } = await loadFixture(PlayerFeature)
      expect(forecastId).to.deep.equal(['2x1'])
    })
    it('Verify getForecast', async function () {
      const {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        forecastId,
        timestamp,
      } = await loadFixture(PlayerFeature)
      const forecastInfo = await deployedContract.getForecast(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
      )
      expect(forecastInfo).to.deep.equal([
        ['France', 'Allemagne'],
        [100, 100],
        [0, 0],
        0,
        timestamp,
        0,
        false,
      ])
    })
    it('Verify setForecastProno', async function () {
      const {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        forecastId,
        timestamp,
      } = await loadFixture(PlayerFeature)
      await deployedContract.setForecastProno(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
        [1, 2],
      )
      const forecastInfo = await deployedContract.getForecast(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
      )
      expect(forecastInfo).to.deep.equal([
        ['France', 'Allemagne'],
        [1, 2],
        [0, 0],
        0,
        timestamp,
        0,
        false,
      ])
    })
    it('Verify updateTime', async function () {
      const {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        forecastId,
      } = await loadFixture(PlayerFeature)
      await deployedContract.updateTime(leaguesID[0], forecastId[0])
      const forecastInfo = await deployedContract.getForecast(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
      )
      expect(forecastInfo[5].toString()).to.equal([0].toString())
    })
    it('Verify setForecastResult', async function () {
      const {
        deployedContract,
        leaguesID,
        TeamsIdFromOneLeague,
        forecastId,
        timestamp,
      } = await loadFixture(PlayerFeature)
      await deployedContract.setForecastProno(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
        [2, 2],
      )
      await deployedContract.setForecastResult(leaguesID[0], forecastId[0], [
        2,
        2,
      ])
      const forecastInfo = await deployedContract.getForecast(
        leaguesID[0],
        TeamsIdFromOneLeague,
        forecastId[0],
      )
      expect(forecastInfo).to.deep.equal([
        ['France', 'Allemagne'],
        [2, 2],
        [0, 0],
        0,
        timestamp,
        0,
        false,
      ])
    })
  })

  describe('NFT Drop', function () {
    function getDate(str) {
      const [dateComponents, timeComponents] = str.split(' ')
      const [month, day, year] = dateComponents.split('/')
      const [hours, minutes, seconds] = timeComponents.split(':')
      const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds)
      const timestamp = Math.trunc(date.getTime() / 1000)
      return timestamp
    }
    async function NFTFeature() {
      const { deployedContract } = await loadFixture(deployTokenFixture)
      const signer2 = await ethers.getSigner(
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      )
      const signer3 = await ethers.getSigner(
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      )
      await deployedContract.addLeague(
        '0x1',
        'Coupe du Monde',
        'https://ipfs_link',
      )
      const leaguesID = await deployedContract.getLeaguesID()
      await deployedContract.addTeam(
        leaguesID[0],
        '1x1',
        'adoption Team',
        'robin',
        'https://ipfs_link',
      )
      const teamsID = await deployedContract.getTeamsIdFromOneLeague(
        leaguesID[0],
      )
      await deployedContract
        .connect(signer2)
        .addPlayer(leaguesID[0], teamsID[0], 'Paul')
      await deployedContract
        .connect(signer3)
        .addPlayer(leaguesID[0], teamsID[0], 'Pierre')
      const timestamp = getDate('11/08/2023 20:30:9')
      await deployedContract.addForecast(
        leaguesID[0],
        '2x1',
        ['France', 'Allemagne'],
        timestamp,
      )
      await deployedContract.setForecastPointNb(
        leaguesID[0],
        teamsID[0],
        '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '2x1',
        3,
      )
      await deployedContract.setForecastPointNb(
        leaguesID[0],
        teamsID[0],
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '2x1',
        2,
      )
      await deployedContract.setForecastPointNb(
        leaguesID[0],
        teamsID[0],
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '2x1',
        6,
      )
      await deployedContract.updateScore(leaguesID[0], teamsID[0])
      return { deployedContract, leaguesID, teamsID }
    }
    it('Verify SortBestPlayers', async function () {
      const { deployedContract, leaguesID, teamsID } = await loadFixture(
        NFTFeature,
      )
      await deployedContract.SortBestPlayers(leaguesID[0])
      const bestPalyers = await deployedContract.getBestPlayers(
        leaguesID[0],
        teamsID[0],
      )
      expect(bestPalyers).to.deep.equal([
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      ])
    })

    it('Verify SortBestTeams', async function () {
      const { deployedContract, leaguesID } = await loadFixture(NFTFeature)
      await deployedContract.SortBestTeams(leaguesID[0])
      const bestTeams = await deployedContract.getBestTeams(leaguesID[0])
      expect(bestTeams).to.deep.equal([ '1x1', '', '' ])
    })
  })
})
