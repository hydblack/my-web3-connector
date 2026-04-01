import { BaseInjectedWallet } from './BaseInjectedWallet';

export class PhantomWallet extends BaseInjectedWallet {
    protected async detectProvider(): Promise<any> {
        if ('phantom' in window) {
            const anyWindow: any = window;
            const provider = anyWindow.phantom?.ethereum;
            if (provider) {
                console.log('Phantom provider detected', provider);
                return provider;
            }
        }
        console.warn('Phantom provider not found');
        return null;
    }

    getWalletName(): string {
        return 'Phantom';
    }
}