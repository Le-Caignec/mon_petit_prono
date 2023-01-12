import './closeLeague.css'
import { Modal, Row, Col, Container, Form, Button } from 'react-bootstrap'
import { BsPersonCircle } from 'react-icons/bs'
import { MonPetitPronoContract } from '../../utils/WebProvider'
import { useParams } from 'react-router-dom'

export default function CloseLeague(props) {
  const { leagueId } = useParams()

  async function CloseLeagueSeason() {
    props.onHide()
    await MonPetitPronoContract.endLeague(leagueId)
    await MonPetitPronoContract.SortBestPlayers(leagueId)
    await MonPetitPronoContract.SortBestTeams(leagueId)
    //wait transaction to be mined
    //window.location.reload()
  }

  return (
    <Modal
      id="modalPopup"
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Row id="modalTitle">
          <Col md={1} id="icon">
            <BsPersonCircle size={45} />
          </Col>
          <Col id="title">End of the Season</Col>
        </Row>
      </Modal.Header>
      <Modal.Body id="leaguModalBody">
        <Container id="CreationFormLeague">
          <h6>
            The Season is Finished, as the administrator it's time for you to
            close it officially for everyone.
          </h6>
          <div id="button">
            <Button onClick={CloseLeagueSeason} type="submit">
              Close Competition
            </Button>
          </div>
        </Container>
      </Modal.Body>
    </Modal>
  )
}
