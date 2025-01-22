import { graphql } from '@octokit/graphql';
import 'dotenv/config';

const token = process.env.GITHUB_TOKEN;

export const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
});
