import {Octokit} from '@octokit/core';
import OpenAI from "openai";
import { sendMessageToTelegram, waitForThumbsUpReaction, postTweet, filter_out_bots, map_to_simplify } from './utils.js';
import fs from 'fs';
import path from 'path';
import { TwitterApi } from 'twitter-api-v2';
// add comment for final test


const openai = new OpenAI();

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT, // Read from environment variable
});

const twitterClient = new TwitterApi({
    appKey : process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_KEY_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// testing final test
async function fetchComments() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 55);

        const filePath = path.resolve(process.cwd(), '.github', 'workflows', 'intro.txt');

        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Format the date in ISO 8601 format
        const since = oneWeekAgo.toISOString();
        const comments_response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues/comments', {
            owner: 'OWNER',
            repo: 'REPO',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
            since,
            per_page: 10000,
        });

        const issues_response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues', {
            owner: 'OWNER',
            repo: 'REPO',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
            since,
            per_page: 10000,
        });

        const commentsWithoutBots = filter_out_bots(comments_response.data);

        const comments = map_to_simplify(commentsWithoutBots);

        // TODO remove comment
        try {
            const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: `Context: Here's an intro to the omSupply repo:\n\n${fileContent}\n\nThese are some key comments from GitHub issues and related tasks this week:\n\n${comments}\n\nIssues involved:\n\n${issues_response.data}\n\nPlease generate a tweet of strictly less than 280 characters summarizing the most significant work this release (8 weeks incl 2 week downtime). Don't mention exact time frames, as release cycle lengths may change. You can mention release. Focus on one key point, such as a feature released, a bug fixed, or a milestone reached. Cut out unnecessary details and make it crisp. The tweet should be clear, concise, and suitable for social media. Everyone working on this is part of TMF, and it's all open-source work.`
                },
            ],
            });
            // console.log(
            //     'completion', completion
            // );

            const generatedContent = completion.choices[0].message.content;
            
            // const generatedContent = 'test';
            console.log('generated content', generatedContent);

            // const generatedContent = 'test generated content'

            const message = await sendMessageToTelegram(generatedContent, process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID);
            await waitForThumbsUpReaction(message, generatedContent, process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID, twitterClient);

        } catch (error) {
            console.log(error);
        }

    // fs.writeFileSync('./generated_post.md', generatedContent, 'utf8');

    } catch (error) {
        console.error('Error:', error);
    }


}

fetchComments();



