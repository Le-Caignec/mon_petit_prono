import './nft.css'
import { Container, Row, Col } from 'react-bootstrap'
import OneNft from './OneNft'
import { useQuery, gql } from '@apollo/client'
import { useSelector } from 'react-redux'

export default function Nft() {
  const wallet = useSelector((state) => state.wallet)
  let walletAddress = wallet.accountAddress
  const GET_NFT = gql`
    query MyNFT($walletAddress: String!) {
      owner(id: $walletAddress) {
        id
        tokens {
          id
          tokenURI
        }
      }
    }
  `
  const { loading, error, data } = useQuery(GET_NFT, {
    variables: { walletAddress },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error : {error.message}</p>

  return (
    <Container id="nft">
      <Row>
        {data.owner.tokens?.map(({ id, tokenURI }) => (
          <Col key={id}>
            <OneNft
              key={id}
              tokenID={id}
              owner={data.owner.id}
              tokenURI={tokenURI.split('/')[4]}
            />
          </Col>
        ))}
      </Row>
    </Container>
  )
}