import { BaseInjectedWallet } from './BaseInjectedWallet';

export class MetaMaskWallet extends BaseInjectedWallet {
    protected async detectProvider(): Promise<any> {
        if ('ethereum' in window) {
            const anyWindow: any = window;
            const provider = anyWindow.ethereum;
            if (provider?.isMetaMask) {
                console.log('MetaMask provider detected', provider);
                return provider;
            }
        }
        console.warn('MetaMask provider not found');
        return null;
    }

    getWalletName(): string {
        return 'MetaMask';
    }
}