import { Notification, IChannelSender } from '../interfaces';

export class PartyKitSender implements IChannelSender {
    private partyUrl: string;

    constructor(partyUrl?: string) {
        this.partyUrl = partyUrl || 'http://127.0.0.1:1999/party';
    }

    isReady(): boolean {
        return !!this.partyUrl;
    }

    async send(notification: Notification): Promise<void> {
        if (!this.isReady()) {
            const errorMessage = 'PartyKitSender is not ready (partyUrl not configured).';
            console.warn(errorMessage + ' Cannot send message.');
            return Promise.reject(new Error(errorMessage));
        }

        if (!notification.recipient.id) {
            const errorMessage = 'Recipient ID (room ID) is missing for PartyKit notification';
            console.error(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }

        const fullUrl = `${this.partyUrl}/${notification.recipient.id}`;

        try {
            await fetch(fullUrl, {
                method: 'POST',
                body: JSON.stringify(notification.message),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(`PartyKit message sent to room ${notification.recipient.id}`);
        } catch (error) {
            console.error(`Failed to send PartyKit message to room ${notification.recipient.id}:`, error);
            throw error;
        }
    }

    destroy(): void {
        console.log('PartyKitSender destroy called - no specific action taken.');
    }
}
