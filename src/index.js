import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './ScrollToTop.js'
import { store } from './utils/Store.js'
import { Provider } from 'react-redux'
import { WebProvider } from './utils/WebProvider.js'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

/**const chains = [
  {
    chainId: '0x' + parseInt(134).toString(16),
    chainName: 'iExec Sidechain',
    nativeCurrency: {
      name: 'xRLC',
      symbol: 'xRLC',
      decimals: 18,
    },
    rpcUrls: ['https://bellecour.iex.ec'],
    blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
  },
]
 Wagmi client
const { provider } = configureChains(chains, [
  jsonRpcProvider({
    rpc: () => ({
      http: 'https://bellecour.iex.ec',
    }),
  }),
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider,
})

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains)*/

// Apollo Client
const client = new ApolloClient({
  uri: 'https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/erc721',
  cache: new InMemoryCache(),
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <WebProvider />
        <ScrollToTop />
        <App />
      </Provider>
    </ApolloProvider>
  </BrowserRouter>,
)
