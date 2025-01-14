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

        const oms_into_blurb = fs.ReadFile('intro.txt')

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

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: `Here are some comments from GitHub issues on TMF's msupply repo:\n\n${comments}\n\n Also here are the issues they refer to:\n\n${issues_response.data}\n\nThese are both based on the previous weeks' work. Based on these comments and issues, please generate a summary post of what we've been up to this week for socials. Please be moderately specific in what issues were worked on, but also use your judgement on what would be best for socials. Approx 100-200 words is great. Do not worry about any preface like 'sure, here you go!'. Please generate this response in markdown format. Some more context you might find helpful is: Basically everyone working on this is part of the TMF org. Also, could you make this post slightly more layperson accessible? Also using standardised hashtags would be awesome - some flexibility but maybe always use a :rocket and #TMF. Also here is the intro to OMS blurb which could also be helpful context: ${oms_into_blurb}`,
                },
            ],
        });

        const generatedContent = completion.data.choices[0].message.content;

        fs.writeFileSync('./generated_post.md', generatedContent, 'utf8');

    } catch (error) {
        console.error('Error fetching comments:', error);
      }


}

fetchComments();

const filter_out_bots = (comments) => {
    return comments.filter(comment => comment.user.type != 'bot');
}

const map_to_simplify = (comments) => {
    return comments.map(comment => (
        {
        user: comment.user.login,
        time: comment.updated_at,
        body: comment.body,
        reactions: comment.reactions,
        issue_number: comment.issue_url.match(/\/issues\/(\d+)$/)[1],
    })).join('\n');
}