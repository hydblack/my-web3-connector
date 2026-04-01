import { BaseInjectedWallet } from './BaseInjectedWallet';

declare global {
    interface Window {
        okxwallet?: any;
    }
}

export class OKXWallet extends BaseInjectedWallet {
    protected async detectProvider(): Promise<any> {
        if (window.okxwallet) {
            console.log('OKXWallet provider detected', window.okxwallet);
            return window.okxwallet;
        }
        console.warn('OKXWallet provider not found');
        return null;
    }

    getWalletName(): string {
        return 'OKXWallet';
    }
}