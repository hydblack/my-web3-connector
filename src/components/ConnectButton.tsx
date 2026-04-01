import React, { useState } from 'react';
import styles from '../styles/ConnectButton.module.css';
import WalletModal from './WalletModal';
import AccountModal from './AccountModal';
import NetworkModal from './NetworkModal';
import { MetaMaskWallet, OKXWallet, PhantomWallet } from '../core';
import { useWeb3 } from '../context/Web3Context';
import { formatEther } from 'viem';

const getChainName = (chainId: number | null) => {
  switch (chainId) {
    case 1: return 'Ethereum';
    case 11155111: return 'Sepolia';
    case 137: return 'Polygon';
    default: return 'Unknown';
  }
};

const wallets = [
    new MetaMaskWallet(),
    new OKXWallet(),
    new PhantomWallet(),
];

const ConnectButton: React.FC = () => {
  const { account, connecting, disconnect, isConnected } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const handleConnect = () => setShowWalletModal(true);
  const handleDisconnect = async () => {
    await disconnect();
    setShowAccountModal(false);
  };

  // 1. 连接中状态
  if (connecting) {
    return (
      <button className={styles.connectButton} disabled>
        <span className={styles.spinner}></span>
        Connecting...
      </button>
    );
  }

  // 2. 已连接状态
  if (isConnected && account) {
    return (
      <>
        <div className={styles.walletGroup}>
          <button
            className={styles.networkButton}
            onClick={() => setShowNetworkModal(true)}
            title="Switch Network"
          >
            <span className={styles.chainName}>{getChainName(account.chainId)}</span>
            <span className={styles.chainIcon}>▼</span>
          </button>

          <button className={styles.accountButton} onClick={() => setShowAccountModal(true)}>
            <div className={styles.balanceContainer}>
              <span className={styles.balanceValue}>
                {parseFloat(formatEther(BigInt(account.balance || 0))).toFixed(3)}<span className={styles.ethSymbol}>ETH</span>
              </span>
            </div>
            <div className={styles.accountCard}>
              <div className={styles.walletAvatar}>🐭</div>
              <div className={styles.accountInfo}>
                <span className={styles.address} title={account.address}>
                  {account.ens || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                </span>
              </div>
            </div>
          </button>
        </div>

        {showAccountModal && (
          <AccountModal
            onClose={() => setShowAccountModal(false)}
            onDisconnect={handleDisconnect}
            account={account}
          />
        )}

        {showNetworkModal && (
          <NetworkModal onClose={() => setShowNetworkModal(false)} />
        )}
      </>
    );
  }

  // 3. 未连接状态
  return (
    <>
      <button onClick={handleConnect} className={styles.connectButton}>
        Connect Wallet
      </button>
      {showWalletModal && (
        <WalletModal
          wallets={wallets}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </>
  );
};

export default ConnectButton;