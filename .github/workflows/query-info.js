import {Octokit} from '@octokit/core'

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
        console.log(map_to_simplify(response.data));
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

fetchComments();

const map_to_simplify = (comments) => {
    return comments.map(comment => ({
        user: comment.user.login,
        time: comment.updated_at,
        comment: comment.body,
    }));
}