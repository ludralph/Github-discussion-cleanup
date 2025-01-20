import 'dotenv/config';
import { graphql } from "@octokit/graphql";

// Initialize the GraphQL client with your GitHub token
const token = process.env.GITHUB_TOKEN;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
});

// Closing message for answered discussions
const answeredClosingMessage = (username) => `Hi @${username},

To keep our discussions organized and focused on the most relevant topics, we’re reviewing and tidying up our backlog. As part of this process, we’re closing discussions that have already been marked as answered but remain open.

If this discussion still requires further input or clarification, feel free to reopen it or start a new one with updated details. Your contributions are invaluable to the community, and we’re here to help!

For more details about our priorities and vision for the future of Prisma ORM, check out our latest blog post: https://www.prisma.io/blog/prisma-orm-manifesto.

Thank you for your understanding and ongoing support of the Prisma community!`;

// Closing message for unanswered discussions
const unansweredClosingMessage = `To keep our discussions organized and focused on the most relevant topics, we’re reviewing and tidying up our backlog. As part of this process, we’re closing discussions that haven’t had any recent activity and appear to be outdated.

If this discussion is still important to you or unresolved, we’d love to hear from you! Feel free to reopen it or start a new one with updated details.

For more details about our priorities and vision for the future of Prisma ORM, check out our latest blog post: https://www.prisma.io/blog/prisma-orm-manifesto.

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
async function closeDiscussion(discussionId, reason) {
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
      reason, // Dynamically passing the reason
    },
  };

  const response = await graphqlWithAuth(query, variables);
  return response.closeDiscussion.discussion;
}

// Main function to process discussions
const processDiscussions = async () => {
  let hasNextPage = true;
  let after = null;

  // Search query for answered discussions
  const answeredQuery = `repo:prisma/prisma is:open is:answered category:"Q&A" created:2020-05-01..2020-05-01 updated:<2024-12-01`;

  // Search query for unanswered discussions
  //const unansweredQuery = `repo:prisma/prisma is:open is:unanswered category:"Q&A" created:2020-01-01..2020-12-31 updated:<2024-12-01`;

  // Process answered discussions
  console.log("Processing answered discussions...");
  while (hasNextPage) {
    const { edges, pageInfo } = await searchDiscussions(answeredQuery, after);
    for (const { node } of edges) {
      const { id, title, url, author } = node;

      console.log(`Adding closing comment to answered discussion: ${title} (${url})`);
      const closingMessage = answeredClosingMessage(author.login);
      await addDiscussionComment(id, closingMessage); // Add a closing comment
      console.log(`Closing answered discussion: ${title} (${url})`);
      await closeDiscussion(id, 'RESOLVED'); // Close the discussion with RESOLVED reason
    }
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  // Reset pagination for unanswered discussions
  hasNextPage = true;
  after = null;

  // // Process unanswered discussions
  // console.log("Processing unanswered discussions...");
  // while (hasNextPage) {
  //   const { edges, pageInfo } = await searchDiscussions(unansweredQuery, after);
  //   for (const { node } of edges) {
  //     const { id, title, url } = node;

  //     console.log(`Adding closing comment to unanswered discussion: ${title} (${url})`);
  //     await addDiscussionComment(id, unansweredClosingMessage); // Add a closing comment
  //     console.log(`Closing unanswered discussion: ${title} (${url})`);
  //     await closeDiscussion(id, 'OUTDATED'); // Close the discussion with OUTDATED reason
  //   }
  //   hasNextPage = pageInfo.hasNextPage;
  //   after = pageInfo.endCursor;
  // }
};

// Run the script
processDiscussions().catch((error) => {
  console.error("Script encountered an error:", error);
});
