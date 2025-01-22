import { githubClient } from './graphqlClient.mts';

export const searchDiscussions = async (searchQuery: string, after: string | null) => {
  const query = `
    query($searchQuery: String!, $after: String) {
      search(query: $searchQuery, type: DISCUSSION, first: 50, after: $after) {
        edges {
          node {
            ... on Discussion {
              id
              title
              url
              createdAt
              answerChosenAt
              category { name }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  return await githubClient({ query, searchQuery, after });
};

export const addDiscussionComment = async (discussionId: string, body: string) => {
  const mutation = `
    mutation($discussionId: ID!, $body: String!) {
      addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
        comment { id }
      }
    }
  `;
  return await githubClient({ query: mutation, discussionId, body });
};

export const closeDiscussion = async (discussionId: string) => {
  const mutation = `
    mutation($discussionId: ID!) {
      closeDiscussion(input: { discussionId: $discussionId }) {
        discussion { id }
      }
    }
  `;
  return await githubClient({ query: mutation, discussionId });
};
