async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  console.log('Account balance:', (await deployer.getBalance()).toString())

  /*const NFT_Smart_contract = await ethers.getContractFactory('PetitProno')
  const contractNFT = await NFT_Smart_contract.deploy()
  await contractNFT.deployed()*/

  const MonPetitProno = await ethers.getContractFactory('PetitProno')
  const contract = await MonPetitProno.deploy()
  await contract.deployed()

  /*const Oracle = await ethers.getContractFactory('GetOracleInfo')
  const Oraclecontract = await Oracle.deploy()
  await Oraclecontract.deployed()

  console.log('Contract Oracle address:', Oraclecontract.address)*/
  //console.log('Contract NFT address:', contractNFT.address)
  console.log('Contract MonPetitProno address:', contract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
