const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-dac3e2d0-869f-495b-809d-f2370f1f6221',
    subscribeKey: 'sub-c-2fc631f7-e20c-4155-9b44-92ed0ff07db1',
    secretKey: 'sec-c-ZjI4OWU1YjQtMDdhNy00MThkLWI3ZDEtMWU3NjA4MjA3MWNi'
}

const CHANNELS = {
    FIRST_CHANNEL: 'FIRST_CHANNEL',
    SECOND_CHANNEL: 'SECOND_CHANNEL'
}

class PubSub {
    constructor() {
        this.pubhub = new PubNub(credentials);

        this.pubhub.sibscribe({ channels: Object.values(CHANNELS) });

        this.pubhub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject;

                console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            }
        }
    }

    publish({channel, message}) {
        this.pubnub.publish({channel, message});
    }
}

module.exports = PubSub;
