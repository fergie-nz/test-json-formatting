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
            per_page: 1000,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Write a haiku about recursion in programming.",
                },
            ],
        });
        
        console.log(completion.choices[0].message);
        // console.log(map_to_simplify(response.data));
        // console.log((response.data));
    } catch (error) {
        console.log(error)
        if (error && error.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          console.log(`Rate limit exceeded, retrying after ${retryAfter} seconds.`);
          await delay(retryAfter * 1000); // Convert to milliseconds
        //   return fetchComments();
        }
        console.error('Error fetching comments:', error);
      }
}

fetchComments();

const map_to_simplify = (comments) => {
    return comments.map(comment => ({
        user: comment.user.login,
        // time: comment.updated_at,
        comment: comment.body,
        // reactions: comment.reactions,
    }));
}