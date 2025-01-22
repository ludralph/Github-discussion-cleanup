import { processDiscussions } from './processors/discussionProcessor.mts';

(async () => {
  const searchQuery = 'repo:prisma/prisma is:open is:answered category:Q&A created:2022-07-01..2022-07-31 updated:<2024-12-01';
  try {
    console.log('Processing answered discussions...');
    await processDiscussions(searchQuery);
    console.log('Processing completed successfully.');
  } catch (error) {
    console.error('Script encountered an error:', error);
  }
})();
