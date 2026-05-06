import React, { useContext, useState } from 'react';
import styles from '../styles/ConnectButton.module.css';
import WalletModal from './WalletModal';
import AccountModal from './AccountModal';
import NetworkModal from './NetworkModal';
import { MetaMaskWallet, OKXWallet, PhantomWallet } from '../core';
import { Web3Context, useWeb3State } from '../context/Web3Context';
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

/** 
 * 核心按钮逻辑，始终从最近的 Web3Context 中取状态。
 * 由 ConnectButton 或外部 Web3Provider 提供 context。
 */
const ConnectButtonInner: React.FC = () => {
  const ctx = useContext(Web3Context)!;
  const { account, connecting, disconnect, isConnected } = ctx;

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

/**
 * 开箱即用的 Web3 连接按钮。
 *
 * - **独立使用**：直接放置即可，无需任何 Provider 包裹。
 *   ```jsx
 *   <ConnectButton />
 *   ```
 *
 * - **共享状态**：若需在其他组件中访问 Web3 状态（useWallet），
 *   可在外层包裹 Web3Provider，ConnectButton 会自动使用外部 context。
 *   ```jsx
 *   <Web3Provider>
 *     <ConnectButton />
 *     <MyOtherComponent />  // 可通过 useWallet() 访问连接状态
 *   </Web3Provider>
 *   ```
 */
const ConnectButton: React.FC = () => {
  const externalCtx = useContext(Web3Context);

  // 已有外部 Provider，直接渲染内部按钮即可
  if (externalCtx) {
    return <ConnectButtonInner />;
  }

  // 没有外部 Provider，自带独立 Provider
  return (
    <StandaloneProvider>
      <ConnectButtonInner />
    </StandaloneProvider>
  );
};

/**
 * 内置的独立 Provider，仅在没有外部 Web3Provider 时使用。
 */
const StandaloneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useWeb3State();
  return <Web3Context.Provider value={state}>{children}</Web3Context.Provider>;
};

export default ConnectButton;
