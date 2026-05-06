import React, { createContext, useContext, useState } from 'react';
import { AccountInfo, BaseInjectedWallet, MetaMaskWallet, OKXWallet, PhantomWallet } from '../core';
import { MyWalletExtention } from '../core/MyWalletExtention';
import { BaseWallet } from '../core/BaseWallet';

export type WalletType = 'MetaMask' | 'OKXWallet' | 'Phantom' | 'MyWallet';

export interface Web3State {
    wallet: BaseWallet | null;
    account: AccountInfo | null;
    connecting: boolean;
    error: Error | null;
    connect: (walletType: WalletType) => Promise<void>;
    disconnect: () => Promise<void>;
    switchChain: (chainId: number) => Promise<void>;
    isConnected: boolean;
}

export const Web3Context = createContext<Web3State | null>(null);

/**
 * 内部状态 hook，供 Web3Provider 和 ConnectButton 内置 Provider 共用
 */
export const useWeb3State = (): Web3State => {
    const [wallet, setWallet] = useState<BaseWallet | null>(null);
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = async (walletType: WalletType) => {
        setConnecting(true);
        setError(null);
        try {
            let selectedWallet: BaseWallet;
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
                case 'MyWallet':
                    selectedWallet = new MyWalletExtention();
                    break;
                default:
                    throw new Error(`Unsupported wallet type: ${walletType}`);
            }
            setWallet(selectedWallet);
            const accountInfo = await selectedWallet.connect();
            setAccount(accountInfo);
            selectedWallet.on('accountsChanged', ({ accounts, balance }) => {
                if (accounts.length === 0) disconnect();
                else setAccount({ ...accountInfo, address: accounts[0], balance });
            });
            selectedWallet.on('chainChanged', ({ chainId, balance }) => {
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

    return {
        wallet,
        account,
        connecting,
        error,
        connect,
        disconnect,
        switchChain,
        isConnected: !!account,
    };
};

/**
 * 可选的外部 Provider，供需要在多个子组件间共享 Web3 状态时使用。
 * 直接使用 <ConnectButton /> 时无需此 Provider。
 */
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const state = useWeb3State();
    return <Web3Context.Provider value={state}>{children}</Web3Context.Provider>;
};

/**
 * 在 Web3Provider 内部使用，获取共享的 Web3 状态。
 * ConnectButton 内部不依赖此 hook（已内置状态）。
 */
export const useWeb3 = (): Web3State => {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
    return ctx;
};
