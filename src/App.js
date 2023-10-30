import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import realEstateabi from "./abis/RealEstate.json";
import escrowabi from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  const [escrow, setEscrow] = useState(null);
  const [homes, setHomes] = useState([]);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null); //null default value of state
  const loadChain = async () => {
    //conect the user denoted by window.etherum to chain
    const provd = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provd);
    const networkd = await provider.getNetwork(); //to get network id for hadhat 31337 in config.json
    const esccontraddr = config[networkd.chainId].escrow.address;
    const realestcontraddr = config[networkd.chainId].realEstate.address;
    // console.log(esccontraddr, realestcontraddr);
    const escrow = new ethers.Contract(esccontraddr, escrowabi, provider); //to create js version of the contract
    const realEstate = new ethers.Contract(
      realestcontraddr,
      realEstateabi,
      provider
    );
    const n = await realEstate.totalSupply();
    //console.log(n.toString());
    setEscrow(escrow);
    const homes = [];
    for (var i = 1; i <= n; i++) {
      const uri = await realEstate.tokenURI(i);
      const respones = await fetch(uri);
      const metadata = await respones.json();
      homes.push(metadata);
    }

    setHomes(homes);
    // console.log(1 + homes);
    // const accs = await window.ethereum.request({
    //   method: "eth_requestAccounts",
    // });
    // setAccount(accs[0]); //save the first account as state
    // console.log(accs[0]);
    // as whenever someone changes accoint on meta mask the page should refresh
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };
  useEffect(() => {
    loadChain();
  }, []);
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>
          Welcome to PropertyChain!
          <div className="cards">
            {homes.map((home, ind) => (
              <div className="card" key={ind}>
                <div className="card__image">
                  <img src={home.image} alt="Home/"></img>
                </div>
                <div className="card__info">
                  <h4>{home.attributes[0].value} eth</h4>
                  <p>
                    <strong>{home.attributes[2].value}</strong> beds |
                    <strong>{home.attributes[3].value}</strong> baths |
                    <strong>{home.attributes[4].value}</strong> sqft
                  </p>
                  <p>{home.address}</p>
                </div>
              </div>
            ))}
          </div>
        </h3>
      </div>
    </div>
  );
}

export default App;
