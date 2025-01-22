import { graphql } from '@octokit/graphql';
import 'dotenv/config';

export const githubClient = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
