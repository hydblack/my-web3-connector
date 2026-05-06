import React from 'react';
import styles from '../styles/Modal.module.css';
import { useWeb3 } from '../context/Web3Context';
import type { WalletType } from '../context/Web3Context';
import metamaskIcon from '../icons/metamask.svg';
import okxIcon from '../icons/okx.png';
import phantomIcon from '../icons/phantom.png';
import myWalletIcon from '../icons/mywallet.png';
import { BaseWallet } from '../core';

interface Props {
  wallets: BaseWallet[];
  onClose: () => void;
}

const walletIconsMap: { [key: string]: string } = {
  'MetaMask': metamaskIcon,
  'OKXWallet': okxIcon,
  'Phantom': phantomIcon,
  'MyWallet': myWalletIcon,
};

const WalletModal: React.FC<Props> = ({ wallets, onClose }) => {
  const { connect } = useWeb3();

  const handleSelect = async (walletType: string) => {
    await connect(walletType as WalletType); 
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Connect Wallet</h3>
          <button className={styles.closeIcon} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className={styles.walletList}>
          {wallets.map((wallet) => (
            <button
              key={wallet.getWalletName()}
              className={styles.walletButton}
              onClick={() => handleSelect(wallet.getWalletName())}
            >
              <div className={styles.iconWrapper}>
                <img
                  src={walletIconsMap[wallet.getWalletName()]}
                  alt={wallet.getWalletName()}
                  className={styles.walletIcon}
                />
              </div>
              <span className={styles.walletName}>{wallet.getWalletName()}</span>
              <span className={styles.arrow}>→</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} className={styles.closeButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletModal;