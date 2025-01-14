import {Octokit} from '@octokit/core'

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT, // Read from environment variable
});

async function fetchComments() {
    try {
        const response = await octokit.request('GET /repos/msupply-foundation/open-msupply/issues/comments', {
            owner: 'OWNER',
            repo: 'REPO',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

fetchComments();