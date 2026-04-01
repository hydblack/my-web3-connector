import { createContext, useContext, useState } from 'react';
import { AccountInfo, BaseInjectedWallet, MetaMaskWallet, OKXWallet, PhantomWallet } from '../core';

interface Web3State {
    wallet: BaseInjectedWallet | null;
    account: AccountInfo | null;
    connecting: boolean;
    error: Error | null;
    connect: (walletType: 'MetaMask' | 'OKXWallet' | 'Phantom') => Promise<void>;
    disconnect: () => Promise<void>;
    switchChain: (chainId: number) => Promise<void>;
    isConnected: boolean;
}

const Web3Context = createContext<Web3State | null>(null);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wallet, setWallet] = useState<BaseInjectedWallet | null>(null);
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = async (walletType: 'MetaMask' | 'OKXWallet' | 'Phantom') => {
        setConnecting(true);
        setError(null);
        try {
            let selectedWallet;
            switch (walletType) {
                case 'MetaMask':
                    selectedWallet = new MetaMaskWallet();
                    break;
                case 'OKXWallet':
                    selectedWallet = new OKXWallet();
                    break;
                case 'Phantom':
                    selectedWallet = new PhantomWallet();
                    break;
                default:
                    throw new Error(`Unsupported wallet type: ${walletType}`);
            }
            setWallet(selectedWallet);
            const accountInfo = await selectedWallet.connect();
            setAccount(accountInfo);
            selectedWallet.on('accountsChanged', ({ accounts, balance }) => {
                console.log('Accounts changed:', accounts, accountInfo);
                if (accounts.length === 0) disconnect();
                else setAccount({ ...accountInfo, address: accounts[0], balance });
            });
            selectedWallet.on('chainChanged', ({ chainId, balance }) => {
                console.log('Chain changed:', chainId, accountInfo);
                setAccount((prev) => prev ? { ...prev, chainId, balance } : null);
            });
        } catch (err) {
            setError(err as Error);
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = async () => {
    if (wallet) {
      await wallet.disconnect();
      setWallet(null);
      setAccount(null);
    }
  };

  const switchChain = async (chainId: number) => {
    if (wallet) {
      await wallet.switchChain(chainId);
    }
  };

  const value = {
    wallet,
    account,
    connecting,
    error,
    connect,
    disconnect,
    switchChain,
    isConnected: !!account,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
    return ctx;
}
