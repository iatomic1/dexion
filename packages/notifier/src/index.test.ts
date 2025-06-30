import { NotifierClient } from './index';
import { Notification, NotificationChannel, NotificationRecipient, IChannelSender } from './interfaces';
import { TelegramSender } from './channels/telegram';
import { PartyKitSender } from './channels/partykit';

// Mock Senders
jest.mock('./channels/telegram');
jest.mock('./channels/partykit');

const MockedTelegramSender = TelegramSender as jest.MockedClass<typeof TelegramSender>;
const MockedPartyKitSender = PartyKitSender as jest.MockedClass<typeof PartyKitSender>;

// Helper function to create a notification
const createNotification = (message: string, recipientId: string): Notification => ({
    message,
    recipient: { id: recipientId },
});

describe('NotifierClient', () => {
    let mockTelegramSenderInstance: jest.Mocked<IChannelSender>;
    let mockPartyKitSenderInstance: jest.Mocked<IChannelSender>;

    beforeEach(() => {
        MockedTelegramSender.mockClear();
        MockedPartyKitSender.mockClear();

        mockTelegramSenderInstance = {
            send: jest.fn(),
            isReady: jest.fn(),
            destroy: jest.fn(),
        };
        mockPartyKitSenderInstance = {
            send: jest.fn(),
            isReady: jest.fn(),
            destroy: jest.fn(),
        };

        MockedTelegramSender.mockImplementation(() => mockTelegramSenderInstance as any);
        MockedPartyKitSender.mockImplementation(() => mockPartyKitSenderInstance as any);
    });

    it('should initialize correctly with all senders', () => {
        const client = new NotifierClient();
        expect(client).toBeInstanceOf(NotifierClient);
        expect(MockedTelegramSender).toHaveBeenCalledTimes(1);
        expect(MockedPartyKitSender).toHaveBeenCalledTimes(1);
    });

    describe('send method', () => {
        it('should call telegramSender.send for telegram channel if ready', async () => {
            (mockTelegramSenderInstance.isReady as jest.Mock).mockReturnValue(true);
            (mockTelegramSenderInstance.send as jest.Mock).mockResolvedValue(undefined);

            const client = new NotifierClient();
            const notification = createNotification('Hello Telegram', 'chat123');
            await client.send('telegram', notification);

            expect(mockTelegramSenderInstance.isReady).toHaveBeenCalledTimes(1);
            expect(mockTelegramSenderInstance.send).toHaveBeenCalledWith(notification);
        });

        it('should reject if telegramSender is not ready', async () => {
            (mockTelegramSenderInstance.isReady as jest.Mock).mockReturnValue(false);
            const client = new NotifierClient();
            const notification = createNotification('Hello Telegram', 'chat123');
            await expect(client.send('telegram', notification))
                .rejects.toThrow('Sender for channel telegram is not ready.');
            expect(mockTelegramSenderInstance.send).not.toHaveBeenCalled();
        });

        it('should call partykitSender.send for partykit channel if ready', async () => {
            (mockPartyKitSenderInstance.isReady as jest.Mock).mockReturnValue(true);
            (mockPartyKitSenderInstance.send as jest.Mock).mockResolvedValue(undefined);

            const client = new NotifierClient();
            const notification = createNotification('Hello PartyKit', 'room123');
            await client.send('partykit', notification);

            expect(mockPartyKitSenderInstance.isReady).toHaveBeenCalledTimes(1);
            expect(mockPartyKitSenderInstance.send).toHaveBeenCalledWith(notification);
        });

        it('should reject if partykitSender is not ready', async () => {
            (mockPartyKitSenderInstance.isReady as jest.Mock).mockReturnValue(false);
            const client = new NotifierClient();
            const notification = createNotification('Hello PartyKit', 'room123');
            await expect(client.send('partykit', notification))
                .rejects.toThrow('Sender for channel partykit is not ready.');
            expect(mockPartyKitSenderInstance.send).not.toHaveBeenCalled();
        });

        it('should reject for an unsupported channel', async () => {
            const client = new NotifierClient();
            const notification = createNotification('Hello Invalid', 'user123');
            await expect(client.send('unsupported' as NotificationChannel, notification))
                .rejects.toThrow('Unsupported channel: unsupported');
        });
    });

    describe('destroyAll method', () => {
        it('should call destroy on all senders', async () => {
            const client = new NotifierClient();
            await client.destroyAll();
            expect(mockPartyKitSenderInstance.destroy).toHaveBeenCalledTimes(1);
        });
    });
}); 