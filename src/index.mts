import { processDiscussions } from './processDiscussions.mts';

processDiscussions().catch((error) => {
  console.error("Script encountered an error:", error);
});
