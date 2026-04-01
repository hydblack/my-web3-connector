import { BaseWallet, AccountInfo } from './BaseWallet';

export abstract class BaseInjectedWallet extends BaseWallet {
    protected provider: any = null;
    protected account: string | null = null;
    protected balance: number | null = null;

    // 子类必须实现检测 provider 的方法（同步或异步，但这里我们让子类在 connect 中调用）
    protected abstract detectProvider(): Promise<any> | any;

    // 子类提供钱包名称
    abstract getWalletName(): string;

    async connect(): Promise<AccountInfo> {
        this.provider = await this.detectProvider();
        if (!this.provider) {
            throw new Error(`${this.getWalletName()} not installed`);
        }

        const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
        const chainId = await this.provider.request({ method: 'eth_chainId' });
        const balance = await this.getBalance();
        this.balance = balance;

        this.setupListeners();
        return {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            balance,
        };
    }

    async getBalance(): Promise<number> {
        if (!this.provider || !this.account) throw new Error('Not connected');
        const balance = await this.provider.request({
            method: 'eth_getBalance',
            params: [this.account, 'latest'],
        });
        return parseInt(balance, 16);
    }

    async disconnect(): Promise<void> {
        this.account = null;
        this.balance = null;
        this.provider = null;
    }

    async getAccount(): Promise<string | null> {
        if (!this.provider) return null;
        const accounts = await this.provider.request({ method: 'eth_accounts' });
        return accounts[0] || null;
    }

    async getChainId(): Promise<number> {
        const chainId = await this.provider.request({ method: 'eth_chainId' });
        return parseInt(chainId, 16);
    }

    async switchChain(chainId: number): Promise<void> {
        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
        } catch (error: any) {
            if (error.code === 4902) {
                throw new Error('Network not added');
            }
            throw error;
        }
    }

    private setupListeners() {
        this.provider.on('accountsChanged', async (accounts: string[]) => {
            this.account = accounts[0] || null;
            let balance: number | undefined;
            if (this.account) {
                balance = await this.getBalance();
                this.balance = balance;
            } else {
                this.balance = null;
            }
            this.emit('accountsChanged', { accounts, balance });
        });

        this.provider.on('chainChanged', async (chainIdHex: string) => {
            const chainId = parseInt(chainIdHex, 16);
            let balance: number | undefined;
            if (this.account) {
                balance = await this.getBalance();
                this.balance = balance;
            }
            this.emit('chainChanged', { chainId, balance });
        });
    }
}