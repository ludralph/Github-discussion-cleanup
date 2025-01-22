import { graphqlWithAuth } from './config.mts';

// Search discussions
export const searchDiscussions = async (searchQuery, after = null) => {
    const graphqlQuery = `
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
                category {
                  name
                }
                author {
                  login
                }
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
  
    const variables = { searchQuery, after };
    try {
      const response = await graphqlWithAuth(graphqlQuery, variables);
      return response.search;
    } catch (error) {
      console.error(`Error during search: ${error.message}`);
      throw error;
    }
  };

// Add a comment to a discussion
export const addDiscussionComment = async (discussionId, body) => {
  const query = `
    mutation addDiscussionComment($input: AddDiscussionCommentInput!) {
      addDiscussionComment(input: $input) {
        comment {
          id
          body
          createdAt
        }
      }
    }
  `;

  const variables = { input: { discussionId, body } };
  return graphqlWithAuth(query, variables);
};

// Close a discussion
export const closeDiscussion = async (discussionId, reason) => {
  const query = `
    mutation closeDiscussion($input: CloseDiscussionInput!) {
      closeDiscussion(input: $input) {
        discussion {
          id
          title
          locked
        }
      }
    }
  `;

  const variables = { input: { discussionId, reason } };
  return graphqlWithAuth(query, variables);
};
