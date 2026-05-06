import { BaseWallet, AccountInfo } from './BaseWallet';

declare global {
    interface Window {
        myWallet?: {
            connect: () => Promise<{ address: string; name?: string; [key: string]: any }>;
            getAccount: () => Promise<{ address: string; name?: string; [key: string]: any } | null>;
            signMessage: (message: string) => Promise<string>;
            disconnect: () => Promise<void>;
        };
        myWalletInjected?: boolean;
    }
}

/**
 * MyWalletExtention 适配器
 *
 * 通过 window.myWallet（由 my-wallet-extention 插件注入）与自研钱包插件通信，
 * 将其接入 my-web3-connector 的 BaseWallet 体系。
 *
 * 通信方式：window.myWallet.connect/getAccount/signMessage/disconnect
 * 链上只读查询：通过 window.ethereum（插件也注入了 EIP-1193 provider）转发
 */
export class MyWalletExtention extends BaseWallet {
    private account: string | null = null;
    private chainId: number | null = null;

    /**
     * 等待 window.myWallet 注入完成（最多等待 3s）
     */
    private async waitForInjection(timeoutMs = 3000): Promise<void> {
        if (window.myWallet) return;
        return new Promise((resolve, reject) => {
            const deadline = Date.now() + timeoutMs;
            const check = () => {
                if (window.myWallet) return resolve();
                if (Date.now() > deadline) return reject(new Error('MyWallet 插件未检测到，请确认已安装并启用'));
                setTimeout(check, 100);
            };
            check();
        });
    }

    /**
     * 获取 EIP-1193 provider
     * 优先使用 window.ethereum（插件注入的兼容层），用于链上只读查询
     */
    private getEthProvider(): any {
        const w = window as any;
        // 优先用 isMyWallet 标记的 provider，避免被 MetaMask 覆盖的情况
        if (w.ethereum?.isMyWallet) return w.ethereum;
        if (w.mywallet) return w.mywallet;
        if (w.ethereum) return w.ethereum;
        return null;
    }

    async connect(): Promise<AccountInfo> {
        await this.waitForInjection();

        const accountData = await window.myWallet!.connect();
        this.account = accountData.address;

        // 通过 EIP-1193 provider 获取 chainId
        this.chainId = await this.getChainId();

        // 获取余额
        const balance = await this.getBalance();

        // 监听账户/链变更事件
        this.setupListeners();

        return {
            address: this.account,
            chainId: this.chainId,
            balance,
        };
    }

    async disconnect(): Promise<void> {
        if (window.myWallet) {
            await window.myWallet.disconnect();
        }
        this.account = null;
        this.chainId = null;
    }

    async getAccount(): Promise<string | null> {
        if (!window.myWallet) return null;
        const accountData = await window.myWallet.getAccount();
        return accountData?.address ?? null;
    }

    async getChainId(): Promise<number> {
        const provider = this.getEthProvider();
        if (!provider) throw new Error('EIP-1193 provider 未找到');
        const chainIdHex: string = await provider.request({ method: 'eth_chainId' });
        return parseInt(chainIdHex, 16);
    }

    async getBalance(): Promise<number> {
        const provider = this.getEthProvider();
        if (!provider || !this.account) return 0;
        const balanceHex: string = await provider.request({
            method: 'eth_getBalance',
            params: [this.account, 'latest'],
        });
        return parseInt(balanceHex, 16);
    }

    async switchChain(chainId: number): Promise<void> {
        const provider = this.getEthProvider();
        if (!provider) throw new Error('EIP-1193 provider 未找到');
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
            this.chainId = chainId;
        } catch (error: any) {
            if (error.code === 4902) {
                throw new Error('该网络尚未添加到钱包，请先调用 wallet_addEthereumChain');
            }
            throw error;
        }
    }

    getWalletName(): string {
        return 'MyWallet';
    }

    /**
     * 监听 EIP-1193 provider 的账户/链变更事件，同步到 BaseWallet 的 emitter
     */
    private setupListeners(): void {
        const provider = this.getEthProvider();
        if (!provider) return;

        provider.on('accountsChanged', async (accounts: string[]) => {
            this.account = accounts[0] || null;
            let balance: number | undefined;
            if (this.account) {
                balance = await this.getBalance();
            }
            this.emit('accountsChanged', { accounts, balance });
        });

        provider.on('chainChanged', async (chainIdHex: string) => {
            const chainId = parseInt(chainIdHex, 16);
            this.chainId = chainId;
            let balance: number | undefined;
            if (this.account) {
                balance = await this.getBalance();
            }
            this.emit('chainChanged', { chainId, balance });
        });
    }
}
