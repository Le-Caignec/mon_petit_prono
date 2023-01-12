import './teamPage.css'
import React from 'react'
import { Container, Form, Breadcrumb, Button } from 'react-bootstrap'
import Team from '../components/teamPage/Team'
import Top from '../components/teamPage/Top'
import { useState, useEffect } from 'react'
import { GiTrophyCup } from 'react-icons/gi'
import JoinNewTeamModal from '../components/modal/JoinNewTeamModal'
import { useSelector } from 'react-redux'
import { NftContract } from '../utils/WebProvider'
import { useParams, useLocation } from 'react-router-dom'
import CloseLeague from '../components/modal/CloseLeague'
import { MonPetitPronoContract } from '../utils/WebProvider'
import { deployContract } from '@nomiclabs/hardhat-ethers/types'

export default function TeamPage() {
  const { leagueId, leagueName } = useParams()
  const location = useLocation()
  const [modalShow, setModalShow] = useState(false)
  const [modalDateShow, setModalDateShow] = useState(false)
  const [bestTreeTeams, setBestTreeTeams] = useState([])
  const [displayGiftVar, setDisplayGiftVar] = useState([])
  const wallet = useSelector((state) => state.wallet)
  let keysPressed = {}

  useEffect(() => {
    async function getOwner() {
      let actualAccount = wallet.accountAddress.toLowerCase()
      let ownerContractAddress = (
        await MonPetitPronoContract.owner()
      ).toLowerCase()
      if (actualAccount === ownerContractAddress) {
        let timeUp = await MonPetitPronoContract.getTime(leagueId)
        if (timeUp === 0 && location.state?.message) {
          const date = new Date(location.state.message)
          date.setUTCHours(23, 59, 59, 999)
          const timestamp = date.getTime()
          if (timestamp / 1000 < Date.now() / 1000) {
            setModalDateShow(true)
          }
        }
      }
    }
    getOwner()
  }, [wallet.accountAddress])

  useEffect(() => {
    async function getBestTeam() {
      let timeUp = await MonPetitPronoContract.getTime(leagueId)
      if (timeUp === 1) {
        let bestTreeTeams = await MonPetitPronoContract.getBestTeams(leagueId)
        setBestTreeTeams(bestTreeTeams)
      }
    }
    getBestTeam()
  }, [])

  useEffect(() => {
    async function showWhatNeedToBeShow() {
      await displayGift(bestTreeTeams)
    }
    showWhatNeedToBeShow()
  }, [bestTreeTeams])

  async function displayGift(bestTreeTeams) {
    let list = await Promise.all(
      bestTreeTeams.map(async (el, rg) => {
        let timeUp = await MonPetitPronoContract.getTime(leagueId)
        if (timeUp === 1) {
          let bestTreeTeams = await MonPetitPronoContract.getBestTeams(leagueId)
          const myTeamsId = await MonPetitPronoContract.getMyTeamFromOneLeague(
            leagueId,
          )
          const info = await MonPetitPronoContract.getPlayerInfo(
            leagueId,
            myTeamsId[0],
            wallet.accountAddress,
          )
          if (
            bestTreeTeams.some((r) => myTeamsId.includes(r)) &&
            info[2][rg] === 1
          ) {
            return true
          }
        }
        return false
      }),
    )
    setDisplayGiftVar(list)
  }

  document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true
  })

  document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true
    if ((keysPressed['Meta'] || keysPressed['Control']) && event.key === 'k') {
      setModalShow(true)
    }
  })

  document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key]
  })

  const mintNFTBestTeam = async (teamID, rg) => {
    NftContract.safeMint(
      wallet.accountAddress,
      'https://ipfs.io/ipfs/QmcGksLEcietBTfCmqsY41D5ACuxYBikuNiw99Lmm9R1qj',
      {
        from: '0x36Bff5B7877dcD2F80cB333987ABA0D9882f0aC3',
        gasLimit: 1000000,
      },
    )
    const tra = await MonPetitPronoContract.MintNFTTeam(leagueId, teamID, rg)
    await tra.wait()
    window.location.reload()
  }

  return (
    <div>
      <Top />
      <Container id="researchBar" fluid>
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="">{leagueName}</Breadcrumb.Item>
        </Breadcrumb>
        <Form>
          <Form.Group>
            <Form.Label>Join an existing team</Form.Label>
            <Form.Control
              type="search"
              placeholder="Cmd + K"
              className="me-2"
              onClick={() => setModalShow(true)}
            ></Form.Control>
          </Form.Group>
        </Form>
      </Container>
      <JoinNewTeamModal show={modalShow} onHide={() => setModalShow(false)} />
      {bestTreeTeams.map(
        (el, rg) =>
          displayGiftVar[rg] && (
            <div id="bestTeam" key={rg}>
              <GiTrophyCup size={40} />
              <h3>
                Félicitaion you win a League NFT as you be a part of the{' '}
                {rg + 1} best team :
              </h3>
              <Button
                id="mintButtonTeam"
                onClick={() => mintNFTBestTeam(el, rg)}
              >
                Mint
              </Button>
            </div>
          ),
      )}
      <Team />
      <CloseLeague
        show={modalDateShow}
        onHide={() => setModalDateShow(false)}
      />
    </div>
  )
}
