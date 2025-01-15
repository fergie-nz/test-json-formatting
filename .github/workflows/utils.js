import axios from 'axios';

const TELEGRAM_URL = "https://api.telegram.org/bot"


export const  sendMessageToTelegram = async (text, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) => {
    const url = `${TELEGRAM_URL}/${TELEGRAM_BOT_TOKEN}/sendMessage`;

    console.log('url', url, "id", TELEGRAM_CHAT_ID, 'text', text);
    const response = await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: text
    });
    return response.data;
}

export const waitForThumbsUpReaction = async ( messageId, generatedContent, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TWITTER_SECRET) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    
    let thumbsUpReceived = false;
    const timeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const startTime = Date.now();

    while (!thumbsUpReceived) {
        const currentTime = Date.now();

        // Check if timeout has passed
        if (currentTime - startTime >= timeout) {
            console.log('Timeout reached (24 hours), stopping...');
            break; // Exit the loop if the timeout is reached
        }

        const response = await axios.get(url, {
            params: {
                offset: -1, // Get the most recent updates
                limit: 1,  // Only check the most recent update
            },
        });

        const updates = response.data.result;

        if (updates.length > 0) {
            const message = updates[0].message;

            // Check if the message has reactions (thumbs-up emoji)
            if (message.chat.id === TELEGRAM_CHAT_ID && message.message_id === messageId) {
                if (message.reply_markup && message.reply_markup.inline_keyboard) {
                    const reactions = message.reply_markup.inline_keyboard;
                    // Check if there's a thumbs-up reaction
                    const thumbsUpReaction = reactions.some(button => button.text === '👍');
                    if (thumbsUpReaction) {
                        thumbsUpReceived = true;
                        console.log('Thumbs-up received, proceeding with the action...');
                    }
                }
            }
        }

        if (!thumbsUpReceived) {
            // Wait for a few seconds before polling again
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    // Timeout or thumbs-up detected
    if (thumbsUpReceived) {
        postTweet(generatedContent, TWITTER_SECRET)
    } else {
        console.log('Action canceled due to timeout.');
    }
}

export const postTweet = async (content, TWITTER_SECRET) => {
    const token = TWITTER_SECRET; // Replace with your Twitter Bearer Token

    try {
        const response = await axios.post(
            'https://api.twitter.com/2/tweets',
            { status: content },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log('Tweet posted successfully:', response.data);
    } catch (error) {
        console.error('Error posting tweet:', error);
    }
}


export const filter_out_bots = (comments) => {
    return comments.filter(comment => comment.user.type != 'bot');
}

export const map_to_simplify = (comments) => {
    return comments.map(comment => (
        {
        user: comment.user.login,
        time: comment.updated_at,
        body: comment.body,
        reactions: comment.reactions,
        issue_number: comment.issue_url.match(/\/issues\/(\d+)$/)[1],
    })).join('\n');
}