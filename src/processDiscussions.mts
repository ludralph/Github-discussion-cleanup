import { searchDiscussions, addDiscussionComment, closeDiscussion } from './githubClient.mts';
import { unansweredClosingMessage, answeredClosingMessage } from './constants.mts';
import { retryWithBackoff, delay } from './utils.mts';

export const processDiscussions = async () => {
  const mutationDelay = 750;

  // Define queries
  //const unansweredQuery = `repo:prisma/prisma is:open is:unanswered category:Q&A created:2021-10-01..2021-10-31 updated:<2024-12-01`;
  const answeredQuery = `repo:prisma/prisma is:open is:answered category:Q&A created:2021-11-01..2021-11-30 updated:<2024-12-01`;

  // Process unanswered discussions
  //console.log("Processing unanswered discussions...");
  //await processQuery(unansweredQuery, unansweredClosingMessage, 'OUTDATED', mutationDelay);

  // Process answered discussions
  console.log("Processing answered discussions...");
  await processQuery(answeredQuery, answeredClosingMessage, 'RESOLVED', mutationDelay);
};

// Helper function to process a specific query
const processQuery = async (query, message, reason, delayTime) => {
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const { edges, pageInfo } = await searchDiscussions(query, after);
    for (const { node } of edges) {
      console.log(`Processing discussion: ${node.title} (${node.url})`);

      // Add comment
      await retryWithBackoff(() =>
        addDiscussionComment(node.id, message)
      );
      console.log(`Added comment to discussion: ${node.title}`);

      // Delay before the next mutation
      await delay(delayTime);

      // Close discussion
      await retryWithBackoff(() =>
        closeDiscussion(node.id, reason)
      );
      console.log(`Closed discussion: ${node.title}`);

      // Delay before the next mutation
      await delay(delayTime);
    }

    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }
};
