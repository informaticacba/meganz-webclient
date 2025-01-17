/**
 * Simple class which should link the window.toaster and Chat
 *
 * @param megaChat
 * @returns {ChatToastIntegration}
 * @constructor
 */
class ChatToastIntegration {
    constructor(megaChat) {
        window.addEventListener("offline", () => this.eventHandlerOffline);
        window.addEventListener("online", () => this.eventHandlerOnline);

        megaChat
            .rebind('onRoomInitialized.cTI', (e, megaRoom) => {
                megaRoom
                    .rebind('onCallPeerJoined.cTI', (e, userHandle) => {
                        // ...
                        const name = nicknames.getNickname(userHandle);
                        // l[24152],
                        // l[24153],

                        window.toaster.alerts.low(
                            // `%NAME joined the call`
                            l[24152].replace("%NAME", this.getTrimmedName(name)),
                            'sprite-fm-mono icon-chat-filled',
                            ChatToastIntegration.DEFAULT_OPTS
                        );
                    })
                    .rebind('onCallPeerLeft.cTI', (e, userHandle) => {
                        if (megaRoom.activeCall && megaRoom.activeCall.sfuApp.isDestroyed) {
                            // Don't show leaving toasts if we are leaving.
                            return;
                        }
                        // ...
                        // l[24154],
                        // l[24155],
                        const name = nicknames.getNickname(userHandle);

                        window.toaster.alerts.low(
                            // `%NAME left the call`
                            l[24154].replace("%NAME", this.getTrimmedName(name)),
                            'sprite-fm-mono icon-chat-filled',
                            ChatToastIntegration.DEFAULT_OPTS
                        );
                    })
                    .rebind('onCallIJoined.cTI', () => {
                        // ...
                        megaRoom.rebind('onMembersUpdated.cTI', ({ data }) => {
                            const { userId, priv } = data;
                            if (userId === u_handle && priv === ChatRoom.MembersSet.PRIVILEGE_STATE.FULL) {
                                window.toaster.alerts.low(
                                    l.chosen_moderator /* `You were chosen to be the moderator of this call` */,
                                    'sprite-fm-mono icon-chat-filled',
                                    ChatToastIntegration.DEFAULT_OPTS
                                );
                            }
                        });
                    })
                    .rebind('onCallPrivilegeChange', (e, userHandle, privilege) => {
                        const name = nicknames.getNickname(userHandle);
                        const role = privilege === ChatRoom.MembersSet.PRIVILEGE_STATE.FULL ? l[8875] : l[8874];

                        window.toaster.alerts.low(
                            `${this.getTrimmedName(name)} was changed to ${role}`,
                            'sprite-fm-mono icon-chat-filled',
                            ChatToastIntegration.DEFAULT_OPTS
                        );
                    })
                    .rebind('onCallEnd.cTI', () => megaRoom.unbind('onMembersUpdated.cTI'));
            });
    }
    eventHandlerOffline() {
        // l[5926]
        window.toaster.alerts.medium(
            l.chat_offline /* `Chat is now offline` */,
            'sprite-fm-mono icon-chat-filled',
            ChatToastIntegration.DEFAULT_OPTS
        );
    }
    eventHandlerOnline() {
        // l[5923]
        window.toaster.alerts.medium(
            l.chat_online /* `Chat is now back online` */,
            'sprite-fm-mono icon-chat-filled',
            ChatToastIntegration.DEFAULT_OPTS
        );
    }
    getTrimmedName(name) {
        const { MAX_NAME_CHARS } = ChatToastIntegration;
        const IN_CALL = document.body.classList.contains('in-call');

        if (IN_CALL) {
            return name.length > MAX_NAME_CHARS ? `${name.substr(0, MAX_NAME_CHARS)}...` : name;
        }

        return name;
    }
}

ChatToastIntegration.MAX_NAME_CHARS = 25;
ChatToastIntegration.DEFAULT_TIMEOUT = 5000;
ChatToastIntegration.DEFAULT_OPTS = { timeout: ChatToastIntegration.DEFAULT_TIMEOUT };
