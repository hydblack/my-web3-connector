import { useWeb3 } from "../context/Web3Context";

export const useWallet = () => {
    const { account, wallet, connecting, error, connect, disconnect, switchChain, isConnected  } = useWeb3();
    return { 
        account, 
        wallet,
        connecting, 
        error, 
        connect, 
        disconnect, 
        switchChain,
        isConnected
    };
};  