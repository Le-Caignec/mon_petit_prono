import './OneCardLeague.css'
import ReactCardFlip from 'react-card-flip'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Container, Card, Button } from 'react-bootstrap'
import { getLeagueIPFSJson, getIPFSImage } from '../../utils/Ipfs'
import { MonPetitPronoContract } from '../../utils/WebProvider'

export default function OneCardLeague({ id, ipfs, NbNFT, Name }) {
  const [nbTeam, setNbTeam] = useState(0)
  const [flip, setFlip] = useState(false)
  const [metadata, setMetadata] = useState({
    backgroundColor: '#FFFFFF',
    image: 'QmVERfcU8E4TBCMTk2cK6fVvqRbRoGkWRYPdkwGwQ8CFbW',
    years: '20XX',
    startDate: 'XX/XX/XXXX',
    endDate: 'XX/XX/XXXX',
  })
  const naviguate = useNavigate()
  const handle = () => {
    let message = metadata.endDate
    naviguate(`/${id}/${Name}`, { state: { message } })
  }
  const [image, setImage] = useState(
    `https://gateway.pinata.cloud/ipfs/${metadata.image}`,
  )

  useEffect(() => {
    getMetadata()
  }, [metadata])

  async function getMetadata() {
    let JsonMetadata = null
    try {
      JsonMetadata = await getLeagueIPFSJson(ipfs)
      console.log('JsonMetadata', JsonMetadata)
    } catch (err) {
      console.log(err)
    }
    if (
      JsonMetadata !== null &&
      JSON.stringify(JsonMetadata) !== JSON.stringify(metadata) &&
      JsonMetadata.image !== undefined &&
      JsonMetadata.backgroundColor !== undefined
    ) {
      setMetadata(JsonMetadata)
    }

    let img = null
    console.log('chose cid image', metadata.image)
    try {
      img = await getIPFSImage(metadata.image)
      console.log('blob img', img)
    } catch (err) {
      console.log(err)
    }
    if (
      img !== null &&
      metadata.image !== 'QmVERfcU8E4TBCMTk2cK6fVvqRbRoGkWRYPdkwGwQ8CFbW'
    ) {
      setImage(img)
    }
  }

  useEffect(() => {
    getNbOfTeam()
  }, [])

  async function getNbOfTeam() {
    const teamId = await MonPetitPronoContract.getTeamsIdFromOneLeague(id)
    setNbTeam(teamId.length)
  }

  function convertToDate(date) {
    var date = new Date(date)
    return (
      date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
    )
  }
  return (
    <ReactCardFlip id={id} isFlipped={flip} flipDirection="horizontal">
      <Card
        id="cardLeagueFront"
        onClick={() => setFlip(!flip)}
        style={{ backgroundColor: metadata.backgroundColor }}
      >
        <img src={image} alt="League" />
      </Card>
      <Card
        id="cardLeagueBack"
        onMouseLeave={() => setFlip(!flip)}
        style={{ backgroundColor: metadata.backgroundColor }}
      >
        <h1>{Name}</h1>
        <h3>- {convertToDate(metadata.startDate).split('/')[2]} -</h3>
        <Container id="infos">
          <h2>Start Date: </h2>
          <h3>{convertToDate(metadata.startDate)}</h3>
          <br />
          <h2>End Date: </h2>
          <h3>{convertToDate(metadata.endDate)}</h3>
          <br />
          <h2>Nb of Team: </h2>
          <h3>{nbTeam}</h3>
          <br />
          <h2>NFT to Win: </h2>
          <h3>{NbNFT}</h3>
        </Container>
        <Button onClick={handle}>Join Competition</Button>
      </Card>
    </ReactCardFlip>
  )
}
