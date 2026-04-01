import React, { useState } from 'react';
import { AccountInfo } from '../core/BaseWallet';
import styles from '../styles/Modal.module.css';

interface Props {
  onClose: () => void;
  onDisconnect: () => void;
  account: AccountInfo;
}

const AccountModal: React.FC<Props> = ({ onClose, onDisconnect, account }) => {
  const [isCopied, setIsCopied] = useState(false); // 2. 新增状态，用于显示复制成功反馈
  const shortAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(account.address);
      console.log('Address copied to clipboard:', account.address, navigator);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Connected Account</h3>
          <button className={styles.closeIcon} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className={styles.addressCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Address</span>
            <div className={styles.statusDot}></div>
          </div>
          <div className={styles.addressValue}>
            <span>{shortAddress}</span>
            <button
              className={styles.copyButton}
              onClick={copyToClipboard}
              title="Copy full address"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className={styles.addressBar}>
            <div className={styles.addressBarFill}></div>
          </div>
        </div>
        <div className={styles.actionGroup}>
          <button onClick={onDisconnect} className={styles.disconnectButton}>
            <span className={styles.btnIcon}>👋</span>
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;