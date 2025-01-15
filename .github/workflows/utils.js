import axios from 'axios';

const TELEGRAM_URL = "https://api.telegram.org/bot"


export const  sendMessageToTelegram = async (text, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) => {
    const url = `${TELEGRAM_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // console.log('url', url, "id", TELEGRAM_CHAT_ID, 'text', text);
    const response = await axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: text
    });
    return response.data;

    // try {
    //     const response = await axios.post(url, {
    //       chat_id: TELEGRAM_CHAT_ID,
    //       text: text,
    //       reply_markup: {
    //         inline_keyboard: [
    //           [
    //             {
    //               text: '👍',
    //               callback_data: 'thumb_up', // Your reaction data
    //             },
    //           ],
    //         ],
    //       },
    //     });
    //     return response.data;
    //   } catch (error) {
    //     console.error('Error sending message with buttons:', error);
    // }
}

// const handleTelegramUpdate = async (update) => {
//     if (update.callback_query) {
//       // This is a reaction or callback (e.g., thumbs up)
//       const userId = update.callback_query.from.id; // Get the user ID of the person reacting
//       const reactionData = update.callback_query.data; // 'thumb_up' or other data
  
//       console.log(`User ${userId} reacted with: ${reactionData}`);
//       // Perform your desired action based on the reaction, e.g., proceed with posting to social media
//     }
// };

export const waitForThumbsUpReaction = async ( message, generatedContent, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TWITTER_SECRET) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
    
    let thumbsUpReceived = false;
    // const timeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeout = 60 * 1000; // 30 seconds in milliseconds
    const startTime = Date.now();

    const initialSentTime = message.result.date;

    console.log('waiting for message');

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

        console.log('response: ', response.data.result);

        const updates = response.data.result;

        for (const update of updates) {
            if (update.message && update.message.text) {
              const userMessage = update.message.text.toLowerCase(); // Convert message to lowercase for case-insensitive comparison
              const userMessageTime = update.message.date; 

              console.log('user message: ', userMessage)
              // Check if the reply is 'approve'
              if (userMessage === 'approve' && userMessageTime > initialSentTime) {
                console.log('User approved, posting to social media...');
                // Perform the action (post to social media, etc.)
                console.log('message', message);
                // await postTweet()
                return
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