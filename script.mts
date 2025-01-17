import 'dotenv/config';
import { graphql } from "@octokit/graphql";

// Initialize the GraphQL client with your GitHub token
const token = process.env.GITHUB_TOKEN;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
});

// Closing message
const closingMessage = `Hi there,

To keep our discussions organized and focused on the most relevant topics, we’re reviewing and tidying up our backlog. As part of this process, we’re closing discussions that haven’t had any recent activity and appear to be outdated.

If this discussion is still important to you or unresolved, we’d love to hear from you! Feel free to reopen it or start a new one with updated details.

For more details about our priorities and vision for Prisma ORM, check out our latest blog post: https://www.prisma.io/blog/prisma-orm-manifesto.

Thank you for your understanding and being part of the community!`;

// Function to search discussions
const searchDiscussions = async (searchQuery, after = null) => {
  const graphqlQuery = `
    query($searchQuery: String!, $after: String) {
      search(query: $searchQuery, type: DISCUSSION, first: 10, after: $after) {
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

  const variables = {
    searchQuery,
    after,
  };

  const response = await graphqlWithAuth(graphqlQuery, variables);
  return response.search;
};

// Function to add a comment to a discussion
async function addDiscussionComment(discussionId, body) {
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

  const variables = {
    input: {
      discussionId,
      body,
    },
  };

  const response = await graphqlWithAuth(query, variables);
  return response.addDiscussionComment.comment;
}

// Function to close a discussion
async function closeDiscussion(discussionId) {
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

  const variables = {
    input: {
      discussionId,
      reason: 'OUTDATED',
    },
  };

  const response = await graphqlWithAuth(query, variables);
  return response.closeDiscussion.discussion;
}

// Main function to process discussions
const processDiscussions = async () => {
  let hasNextPage = true;
  let after = null;

  // Define the search query
  const searchQuery = `repo:prisma/prisma is:open is:unanswered category:"Q&A" created:2020-01-01..2020-12-31`;

  while (hasNextPage) {
    const { edges, pageInfo } = await searchDiscussions(searchQuery, after);
    for (const { node } of edges) {
      const createdAt = new Date(node.createdAt);

      console.log(`Adding closing comment to discussion: ${node.title} (${node.url})`);
      await addDiscussionComment(node.id, closingMessage); // Add a closing comment
      console.log(`Closing discussion: ${node.title} (${node.url})`);
      await closeDiscussion(node.id); // Close the discussion
    }
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }
};

// Run the script
processDiscussions().catch((error) => {
  console.error("Script encountered an error:", error);
});
