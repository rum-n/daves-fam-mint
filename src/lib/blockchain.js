import { ethers, ContractFactory } from 'ethers';
import { setGlobal, getGlobal } from 'reactn';
import abiMutants from './abiMutants.json';
import abiIncubator from './abiIncubator.json';
import bytecode from './bytecode.json';
import toast from 'react-hot-toast';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
            infuraId: process.env.REACT_APP_INFURA_ID // required
        }
    },
};

const web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    theme: "dark",
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
});


export function networkIdToName(id){
    if(id === 1) return 'Mainnet';
    if(id === 4) return 'Rinkeby';
    if(id === 3) return 'Ropsten';
    if(id === 5) return 'Goerli';
    if(id === 42) return 'Kovan';
}

export async function approveIncubator(){
    var res = await runContract(process.env.REACT_APP_INCUBATOR_CONTRACT, abiIncubator, 'setApprovalForAll', [process.env.REACT_APP_MUTANTS_CONTRACT, true]);
    if(res){
        toast.success('Incubator approved');
    }
}


export async function checkIncubatorApproved(){
    console.log('check incubator approved');
    var address = getGlobal().address;
    var result = await runContract(process.env.REACT_APP_INCUBATOR_CONTRACT, abiIncubator, 'isApprovedForAll', [address, process.env.REACT_APP_MUTANTS_CONTRACT]);
    console.log(result);
    return result;
}



export async function mint(currency, amount){
    
    console.log(amount);
    var address = getGlobal().address;
    
    if(currency == 'incubator'){
        var res = await runContract(process.env.REACT_APP_MUTANTS_CONTRACT, abiMutants, 'mintIncubator', [address, amount]);
        if(res){
            toast.success('Mint successful!');
        }
    }

    if(currency == 'eth'){
        var res = await runContract(process.env.REACT_APP_MUTANTS_CONTRACT, abiMutants, 'mintETH', [address, amount, {from: getGlobal().address, value: ethers.utils.parseEther((amount * parseFloat(process.env.REACT_APP_PRICE_ETH)).toString())}]);
        if(res){
            toast.success('Mint successful!');
        }
    }

}

export async function runContract(contract, abi, func, args = [], event = '', eventCallback = () => {}){
    
    if(!window.signer) return;
    
    var contract = new ethers.Contract(contract, abi, window.provider);
    var contractWithSigner = contract.connect(window.signer);
    
    if(event != ''){
        contract.on(event, eventCallback);
    }

    const toastId = toast.loading('waiting for transaction...');
    
    try{
        if(event != ''){
            return await contractWithSigner[func](...args);
        }else{
            var tx = await contractWithSigner[func](...args);
            if(tx.wait) tx = await tx.wait();    
            toast.dismiss(toastId);
            return tx;
        }
    }catch(e){

        toast.dismiss(toastId);
        showError(e);

    }
}


function showError(e){

    console.log(e);

    var error = '';

    if(e.data && e.data.message){
        error = e.data.message;
    }

    if(e.error && e.error.message){
        error = e.error.message;
    }

    error = error.replace('execution reverted: ', '');
    
    if(error.includes('insufficient funds')){
        error = 'Insufficient funds';
    }

    if(error.includes('INVALID_OPERATOR')){
        error = 'Incubator not approved';
    }

    if(error == ''){
        toast.error('please try again');
        return;
    }
    
    toast.error(error);
    

}



export async function connectWallet(){

    try {
        web3Modal.clearCachedProvider();
        var web3modalInstance = await web3Modal.connect();
    } catch(e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    window.provider = new ethers.providers.Web3Provider(web3modalInstance);
    window.signer = window.provider.getSigner();

    web3modalInstance.on("chainChanged", chainId => {
        console.log('chain changed');
        console.log(parseInt(chainId));
        setGlobal({ network: parseInt(chainId) });
    });
    
    var net = await window.provider.getNetwork();
    var address = await window.signer.getAddress();
    
    await setGlobal({ network: net.chainId, address });

}

// format ethereum address
export function formatAddress(address){
    return address.slice(0,6) + '...' + address.slice(-4);
}


