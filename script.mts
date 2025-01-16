import 'dotenv/config';
import { graphql } from "@octokit/graphql";

// Initialize the GraphQL client with your GitHub token
const token = process.env.GITHUB_TOKEN;
console.log(token);
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
});

// Closing message
const closingMessage = `Hi there,

To keep our discussions organized and focused on the most relevant topics, we’re reviewing and tidying up our backlog. As part of this process, we’re closing discussions that haven’t had any recent activity and appear to be outdated.

If this discussion is still important to you or unresolved, we’d love to hear from you! Feel free to reopen it or start a new one with updated details.

For more details about our priorities and vision for the future of Prisma ORM, check out our latest blog post: https://www.prisma.io/blog/prisma-orm-manifesto.

Thank you for your understanding and being part of the community!`;

// Function to fetch discussions
const fetchDiscussions = async (after: string | null = null) => {
  const query = `
    query($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        discussions(first: 10, after: $after, states: OPEN) {
          edges {
            node {
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
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const variables = {
    owner: "prisma", // Replace with the repository owner
    name: "prisma",  // Replace with the repository name
    after,
  };

  const response = await graphqlWithAuth(query, variables);
  return response.repository.discussions;
};

// Function to add a comment to a discussion

async function addDiscussionComment(discussionId: string, body: string) {
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
    }
  };

  const response = await graphqlWithAuth(query, variables);

  return response.addDiscussionComment.comment;
}

// Function to close a discussion
async function closeDiscussion(discussionId: string) {
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
      reason: 'OUTDATED',  // Reason for closing
      
    }
  };

  const response = await graphqlWithAuth(query, variables);

  return response.closeDiscussion.discussion;
}




// Main function to process discussions
const processDiscussions = async () => {
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const { edges, pageInfo } = await fetchDiscussions(after);
    for (const { node } of edges) {
      // Filter discussions by category and other criteria
      const isUnanswered = node.answerChosenAt === null;
      
      const isQA = node.category.name === "Q&A"; // Check the category name
      const createdAt = new Date(node.createdAt);

      if (
        isUnanswered &&
        isQA &&
        createdAt >= new Date("2020-01-01") &&
        createdAt <= new Date("2020-12-31")
      ) {
        console.log(`Adding closing comment to discussion: ${node.title} (${node.url})`);
        await  addDiscussionComment(node.id, closingMessage); // Add a closing comment
        console.log(`Closing discussion: ${node.title} (${node.url})`);
        await closeDiscussion(node.id); // Close the discussion
      }
    }
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }
};

// Run the script
processDiscussions().catch((error) => {
  console.error("Script encountered an error:", error);
});
