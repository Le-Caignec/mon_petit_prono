import axios from 'axios'
import FormData from 'form-data'

async function PostLeagueImage(formData) {
  let imagePath = null
  try {
    const response = await axios({
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_PINIATA_JWT}`,
      },
      data: formData,
    })
    const data = response.data
    imagePath = data.IpfsHash
  } catch (error) {
    console.log(error)
  }
  return imagePath
}

async function PostLeagueMetadata(formData) {
  let imagePath = null
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_PINIATA_JWT}`,
      },
      data: formData,
    })
    const data = response.data
    imagePath = data.IpfsHash
  } catch (error) {
    console.log(error)
  }
  return imagePath
}

export async function addLeagueIPFS(
  _LeagueId,
  _LeagueName,
  file,
  color,
  startDate,
  endDate,
) {
  //Upload the image on OFF-CHAIN storage
  let formData = new FormData()
  formData.append('file', file)
  let imagePath = null
  try {
    imagePath = await PostLeagueImage(formData)
  } catch (err) {
    console.log(err)
  }

  //Upload the metadata on OFF-CHAIN storage
  var data = JSON.stringify({
    LeagueId: `${_LeagueId}`,
    LeagueName: `${_LeagueName}`,
    startDate: `${startDate}`,
    endDate: `${endDate}`,
    backgroundColor: `${color}`,
    description: 'League metadata',
    image: `${imagePath}`,
  })
  let Metadata = null
  try {
    Metadata = await PostLeagueMetadata(data)
  } catch (err) {
    console.log(err)
  }
  return Metadata
}

export async function getLeagueIPFSJson(cid) {
  let url = `https://ipfs.io/ipfs/${cid}`
  let response = null
  if (cid !== '') {
    try {
      let res = await fetch(url)
      response = await res.json()
    } catch (error) {
      console.log(error)
    }
  }
  return response
}

export async function getIPFSImage(cid) {
  let url = `https://ipfs.io/ipfs/${cid}`
  let response = null
  if (cid !== '') {
    try {
      response = fetch(url)
        .then((response) => response.blob())
        .then((myBlob) => {
          return URL.createObjectURL(myBlob)
        })
    } catch (error) {
      console.log(error)
    }
  }
  return response
}
