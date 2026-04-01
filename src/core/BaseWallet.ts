import mitt, { Emitter } from 'mitt';

type Events = {
    accountsChanged: { accounts: string[]; balance?: number };
    chainChanged: { chainId: number; balance?: number };
};

export interface AccountInfo {
    address: string;
    chainId: number;
    ens?: string;
    balance?: number;
}

export abstract class BaseWallet {
    protected emitter: Emitter<Events> = mitt();
    on<E extends keyof Events>(event: E, handler: (data: Events[E]) => void): void {
        this.emitter.on(event, handler);
    }
    protected emit<E extends keyof Events>(event: E, data: Events[E]): void {
        this.emitter.emit(event, data);
    }
    abstract connect(): Promise<AccountInfo>;
    abstract disconnect(): Promise<void>;
    abstract getAccount(): Promise<string | null>;
    abstract getChainId(): Promise<number>;
    abstract switchChain(chainId: number): Promise<void>;
    abstract getWalletName(): string;
    abstract getBalance(): Promise<number>;
}