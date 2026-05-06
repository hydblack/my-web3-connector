import { useWeb3 } from "../context/Web3Context";

/**
 * 在 Web3Provider 内部的组件中使用，获取共享的 Web3 连接状态。
 * 注意：必须在 Web3Provider 包裹的组件树中使用，否则会抛错。
 *
 * @example
 * ```jsx
 * <Web3Provider>
 *   <ConnectButton />
 *   <MyComponent />   // ← 在此组件内可调用 useWallet()
 * </Web3Provider>
 * ```
 */
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
