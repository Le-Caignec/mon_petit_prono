import React from 'react'
import './joinNewTeamModal.css'
import { TextField, Typography, Box, Button } from '@mui/material'
import { Col, Modal, Row, Table, Form, Container } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import { MonPetitPronoContract } from '../../utils/WebProvider'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

export default function JoinNewTeam(props) {
  let { leagueId } = useParams()
  const [searchInput, setSearchInput] = useState('')
  const [AllTeamsAvailable, setAllTeamsAvailable] = useState([])
  const [researchResults, setResearchResults] = useState([])
  const [newTeamsCreated, setNewTeamsCreated] = useState(null)

  MonPetitPronoContract.on(
    'NewTeam',
    (_LeagueId, _TeamId, _Team_name, _ipfs) => {
      console.log('newTeamsCreated : ', _LeagueId)
      setNewTeamsCreated(_TeamId)
    },
  )

  useEffect(() => {
    GetAllTeams()
  }, [newTeamsCreated])

  async function GetAllTeams() {
    const AllTeamsId = await MonPetitPronoContract.getFreeTeamFromOneLeague(
      leagueId,
    )
    let AllTeams = await Promise.all(
      AllTeamsId.map(async (e) => {
        return await MonPetitPronoContract.getTeamsInfos(leagueId, e)
      }),
    )
    console.log('AllTeams : ', AllTeams)
    setAllTeamsAvailable(AllTeams)
    setResearchResults(AllTeams)
  }

  useEffect(() => {
    if (searchInput.length > 0) {
      const resultsearch = AllTeamsAvailable.filter((e) => {
        return e[1].toLowerCase().match(searchInput.toLowerCase())
      })
      setResearchResults(resultsearch)
    } else {
      setResearchResults(AllTeamsAvailable)
    }
  }, [searchInput])

  return (
    <Modal
      id="modalJoinNewTeam"
      {...props}
      size="lg"
      centered
      keyboard
      scrollable
    >
      <Modal.Header>
        <TextField
          fullWidth
          label="Search for a new team..."
          type="search"
          variant="filled"
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </Modal.Header>
      <Modal.Body id="leaguModalBody">
        <Container id="globalTable">
          {researchResults.map((team) => (
            <TeamRow key={team[0]} team={team} onHide={props.onHide} />
          ))}
        </Container>
      </Modal.Body>
    </Modal>
  )
}

function TeamRow({ team, onHide }) {
  let { leagueId } = useParams()
  let elemsLoading = useSelector((state) => state.teamLoading)
  let tabCopy = [...elemsLoading.elemLoading]
  const dispatch = useDispatch()
  const [showOrders, setShowOrders] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [nbOfPlayers, setNbOfPlayers] = useState(0)

  async function joinNewTeam() {
    if (playerName.length > 0) {
      let timeUp = await MonPetitPronoContract.getTime(leagueId)
      if (timeUp === 0) {
        let tra = await MonPetitPronoContract.addPlayer(
          leagueId,
          team[0],
          playerName,
        )
        dispatch({
          type: 'teamLoading/updateElemLoading',
          payload: [...tabCopy, 'oneMore'],
        })
        onHide()
        await tra.wait()
        window.location.reload()
      }else{
        alert('The Competition is Finished')
      }
    } else {
      alert('You must enter a Player name')
    }
  }

  useEffect(() => {
    getNbOfPlayers()
  }, [])

  async function getNbOfPlayers() {
    const addressPlayers = await MonPetitPronoContract.getAllPlayerAddrFromOneTeam(
      leagueId,
      team[0],
    )
    setNbOfPlayers(addressPlayers.length)
  }

  return (
    <Row key={team[0]} id="OneLigne">
      <Box
        onClick={() => setShowOrders(!showOrders)}
        display="flex"
        justifyContent="space-between"
        id="affichage"
      >
        <Typography id="typographie">{team[1]}</Typography>
        <Typography id="typographie">{team[0]}</Typography>
      </Box>
      {showOrders && (
        <div id="line">
          <Table
            id="tableInfo"
            responsive="sm"
            onClick={() => setShowOrders(false)}
          >
            <tbody>
              <tr>
                <td id="firstCell">Award for the First</td>
                <td>1 Gold NFT</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td id="firstCell">Award for the Second</td>
                <td>1 Silver NFT</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td id="firstCell">Award for the Third</td>
                <td>1 Bronze NFT</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td id="firstCell">Award for the best Team </td>
                <td>1 Rare NFT</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td id="firstCell">Perfect score </td>
                <td>1 dynamic NFT</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td id="firstCell">Number of Players</td>
                <td>{nbOfPlayers}/500</td>
              </tr>
            </tbody>
          </Table>
          <Row id="info">
            <Col>
              <Form.Control
                type="text"
                placeholder="Your Name"
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </Col>
            <Col>
              <Button onClick={joinNewTeam}>JOIN THIS TEAM</Button>
            </Col>
          </Row>
        </div>
      )}
    </Row>
  )
}
