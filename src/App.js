import { useGlobal, useState, useEffect } from 'reactn';
import toast, { Toaster } from 'react-hot-toast';
import { ethers } from 'ethers';
import { formatAddress, connectWallet, mint, approveIncubator, checkIncubatorApproved } from './lib/blockchain';;

// const whitelistAddresses = require('./whitelist.json');
// const { MerkleTree } = require('merkletreejs');
// const SHA256 = require('crypto-js/sha256');


function App() {

    const [address] = useGlobal('address');
    const [network] = useGlobal('network');
    const [currency, setCurrency] = useState('');
    const [quantity, setQuantity] = useState(2);
    const [incubatorApproved, setIncubatorApproved] = useState(false);
    
    
    const doMint = async () => {
        console.log('minting');
        if(currency == ''){
            toast.error('Please select if minting with an incubator or with ETH');
            return;
        }
        mint(currency, parseInt(quantity));
    }

    const checkAllowance = async () => {
        console.log('getting allowance');
        if(!address || network != process.env.REACT_APP_NETWORK) return;
        var va = await checkIncubatorApproved();
        setIncubatorApproved(va);
    }

    useEffect(() => {
        console.log('incubator contract: ' + process.env.REACT_APP_INCUBATOR_CONTRACT);
        console.log('mutants contract: ' + process.env.REACT_APP_MUTANTS_CONTRACT);
        checkAllowance();
    }, [address]);

    if(address && network != process.env.REACT_APP_NETWORK) {
        return <div className="text-center py-12">Wrong network, please switch to {process.env.REACT_APP_NETWORK_NAME}</div>;
    }

    return (
        <div className="App">
      
            <div><Toaster/></div>

            <div className="max-w-3xl py-12 mx-auto">

                <div className="flex mb-8">
                    <div className="intro w-4/5">
                        <h2>Mint a mutant rat</h2>
                        <div>
                            Mint a mutant rat using an incubator or ETH.<br />
                            Approve the incubator in order to mint a mutant.
                        </div>
                    </div>
                    <div className="intro w-1/5 text-right">
                        {!address && <button onClick={() => connectWallet()}>Connect wallet</button>}
                        {!!address && formatAddress(address)}
                    </div>
                </div>

                {!!address &&

                    <div className="border-yellow p-6 bg-semi-transparent">
                        <div className="md:flex">


                            <div className="md:w-1/2 md:pr-4">
                                <h2>Select mint option and quantity</h2>
                                
                                <div className="flex mt-12">

                                    <div className="w-2/5">
                                        <div className={"radio-currency " + (currency == 'incubator' ? 'active' : '')} onClick={e => setCurrency('incubator')}>
                                            <span>Incubator</span>
                                        </div>
                                        <div className="text-xs opacity-40">
                                            1 Incubator per nft
                                        </div>
                                    </div>

                                    <div className="w-1/5 text-center pt-3">or</div>
                                    
                                    <div className="w-2/5">
                                        <div className={"radio-currency " + (currency == 'eth' ? 'active' : '')} onClick={e => setCurrency('eth')}>
                                            <span>ETH</span>
                                        </div>
                                        <div className="text-xs opacity-40">
                                            {process.env.REACT_APP_PRICE_ETH} ETH
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="input-qty">
                                        <div className="flex">
                                            <div className="input-qty-label">Quantity</div>
                                            <div>
                                                <input type="text" value={quantity} onChange={e => {
                                                    setQuantity(e.target.value);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {currency == 'incubator' &&
                                    <div className="text-center mt-4">
                                        <button className="button default mx-2 text-sm" onClick={async e => {
                                            await approveIncubator();
                                            await checkAllowance();
                                        }}>{incubatorApproved ? '✓' : ''} Approve Incubator</button>
                                    </div>
                                }

                                <div className="mt-4">
                                    <button className="button secondary w-full" onClick={e => doMint()}>Mint</button>
                                </div>

                            </div>

                            <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
                                <div className="border-blue overflow-hidden">
                                    <img src="/mutant.png" />
                                </div>
                            </div>

                        </div>
                    </div>

                }    
                
            </div>


        </div>
    );

}

export default App;
