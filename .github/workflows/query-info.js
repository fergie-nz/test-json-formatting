import {Octokit} from '@octokit/core';
import OpenAI from "openai";
const openai = new OpenAI();

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT, // Read from environment variable
});

async function fetchComments() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Format the date in ISO 8601 format
        const since = oneWeekAgo.toISOString();
        const response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues/comments', {
            owner: 'OWNER',
            repo: 'REPO',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
            since,
            per_page: 10000,
        });

        const comments = map_to_simplify(response.data);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: `Here are some comments from GitHub issues:\n\n${comments}\n\nBased on these comments, please generate a post in markdown for social media.`,
                },
            ],
        });
        
        console.log(completion.choices[0].message);
        // console.log(map_to_simplify(response.data));
        // console.log((response.data));
    } catch (error) {
        if (error && error.status === 429) {
            console.log('finding status')
        //   const retryAfter = error.response.headers['retry-after'];
        //   console.log(`Rate limit exceeded, retrying after ${retryAfter} seconds.`);
        //   await delay(retryAfter * 1000); // Convert to milliseconds
        //   return fetchComments();
        }
        console.error('Error fetching comments:', error);
      }
}

fetchComments();

const map_to_simplify = (comments) => {
    return comments.map(comment => ({
        user: comment.user.login,
        time: comment.updated_at,
        comment: comment.body,
        reactions: comment.reactions,
    })).join('\n');
}