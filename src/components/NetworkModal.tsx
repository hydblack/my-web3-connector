import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/NetworkModal.module.css';
import { useWeb3 } from '../context/Web3Context';

interface Chain {
  id: string;
  decimalId: number;
  name: string;
}

const SUPPORTED_CHAINS: Chain[] = [
  {
    id: '0x1',
    decimalId: 1,
    name: 'Ethereum Mainnet'
  },
  {
    id: '0xaa36a7',
    decimalId: 11155111,
    name: 'Sepolia Testnet'
  },
];

interface NetworkModalProps {
  onClose: () => void;
}

const NetworkModal: React.FC<NetworkModalProps> = ({ onClose }) => {
  const [loadingChainId, setLoadingChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { switchChain } = useWeb3();

  const switchNetwork = async (chain: Chain) => {
    setLoadingChainId(chain.id);
    setError(null);

    try {
      await switchChain(chain.decimalId);
      onClose();
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          // 添加成功后，MetaMask 通常会自动切换，或者我们可以再次尝试切换
          onClose();
        } catch (addError) {
          setError('Failed to add network');
          console.error(addError);
        }
      } else {
        // 其他错误（如用户拒绝）
        setError('Switch failed');
        console.error(switchError);
      }
    } finally {
      setLoadingChainId(null);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Change Network</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.networkList}>
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              className={styles.networkItem}
              onClick={() => switchNetwork(chain)}
              disabled={loadingChainId === chain.id}
            >
              <span className={styles.networkName}>{chain.name}</span>
              {loadingChainId === chain.id && (
                <span className={styles.spinner} />
              )}
            </button>
          ))}
        </div>
        
        {error && <div className={styles.errorMsg}>{error}</div>}
      </div>
    </div>,
    document.body
  );
};

export default NetworkModal;