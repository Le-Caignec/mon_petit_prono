import './ranking.css'
import { Container, Button } from 'react-bootstrap'
import { Stack, LinearProgress } from '@mui/material'
import Table from 'react-bootstrap/Table'
import { useEffect, useState } from 'react'
import { MonPetitPronoContract } from '../../utils/WebProvider'
import { useParams } from 'react-router-dom'
import { GiTrophyCup } from 'react-icons/gi'
import { useSelector } from 'react-redux'
import { NftContract } from '../../utils/WebProvider'

export default function Ranking() {
  let { leagueId, teamId } = useParams()
  const [ranking, setRanking] = useState([])
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [hide, setHide] = useState(false)
  const wallet = useSelector((state) => state.wallet)
  const [bestTreePlayers, setBestTreePlayers] = useState([])
  const [finalPosition, setFinalPosition] = useState(-1)

  useEffect(() => {
    getRanking()
    getBestTeam()
  }, [])

  async function getBestTeam() {
    let timeUp = await MonPetitPronoContract.getTime(leagueId)
    if (timeUp === 1) {
      let bestTreePlayers = await MonPetitPronoContract.getBestPlayers(
        leagueId,
        teamId,
      )
      bestTreePlayers = bestTreePlayers.map((e) => e.toLowerCase())
      console.log('BEST TREE PLAYERS :', bestTreePlayers)
      setBestTreePlayers(bestTreePlayers)
      const MintPossible = await MonPetitPronoContract.getPlayerInfo(
        leagueId,
        teamId,
        wallet.accountAddress,
      )
      if (
        bestTreePlayers.includes(wallet.accountAddress) &&
        MintPossible[3] === 1
      ) {
        setHide(true)
        setFinalPosition(bestTreePlayers.indexOf(wallet.accountAddress))
      }
    }
  }

  const getRanking = async () => {
    const playersId = await MonPetitPronoContract.getAllPlayerAddrFromOneTeam(
      leagueId,
      teamId,
    )
    let playersInfo = await Promise.all(
      playersId.map(async (e) => {
        let info = await MonPetitPronoContract.getPlayerInfo(
          leagueId,
          teamId,
          e,
        )
        let OnePlayer = [...info]
        OnePlayer[1] = OnePlayer[1].toNumber()
        return [...OnePlayer, e]
      }),
    )
    playersInfo.sort((a, b) => b[1] - a[1])
    setRanking(playersInfo)
  }

  const UpdateScore = async () => {
    setLoadingRanking(true)
    const tr = await MonPetitPronoContract.updateScore(leagueId, teamId)
    await tr.wait()
    window.location.reload()
  }

  const mintNFTBestPlayer = async () => {
    NftContract.safeMint(
      wallet.accountAddress,
      'https://ipfs.io/ipfs/QmXhnr9thFjBY3BrKZChwUEmcKs5t1k4AFZqPYaQvBoaXD',
      {
        from: '0x36Bff5B7877dcD2F80cB333987ABA0D9882f0aC3',
        gasLimit: 1000000,
      },
    )
    const tra = await MonPetitPronoContract.MintNFTPlayer(leagueId, teamId)
    await tra.wait()
    window.location.reload()
  }

  return (
    <Container id="ranking">
      {!loadingRanking && (
        <Button id="updateScore" onClick={UpdateScore}>
          <h1 id="linear-wide">Update Your Rank</h1>
        </Button>
      )}
      {loadingRanking && (
        <Stack
          sx={{
            width: '100%',
            color: 'grey.500',
            margin: 'auto',
            marginBottom: '5%',
          }}
        >
          <LinearProgress color="secondary" />
        </Stack>
      )}
      {hide && (
        <div id="bestTeam">
          <GiTrophyCup size={40} />
          <h3>
            Félicitaion you win a Player NFT as you be a part of the top three
            players on the team :
          </h3>
          <Button id="mintButtonTeam" onClick={mintNFTBestPlayer}>
            Mint
          </Button>
        </div>
      )}
      <Table striped>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Number of Points</th>
            <th>Player Name</th>
            <th>Wallet ID</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((e, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e[1]}</td>
              <td>{e[0]}</td>
              <td id="walletID">{e[2]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}
