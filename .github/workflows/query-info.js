import {Octokit} from '@octokit/core';
import OpenAI from "openai";
import { sendMessageToTelegram, waitForThumbsUpReaction, postTweet, filter_out_bots, map_to_simplify } from './utils.js';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';


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


async function fetchComments() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const test = "fdasdsad fasfas";

        const fileContent = fs.readFileSync('./intro.txt', 'utf8');
        console.log('file content: ', fileContent);

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
                    content: `Here are some comments from GitHub issues on TMF's msupply repo:\n\n${comments}\n\n Also here are the issues they refer to:\n\n${issues_response.data}\n\nThese are both based on the previous weeks' work. Based on these, generate a very brief summary of strictly less than 280 characters (as it is a tweet) of what the team has been up to this week. It would be helpful if you cut the chaff - and mention the specific things we've been working on. It is all open source so don't worry about sharing secrets or anything. Also FYI everyone who was working on this works at TMF, so they're not community reported issues.`,
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



