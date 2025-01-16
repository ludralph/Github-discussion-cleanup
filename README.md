# GITHUB DISCUSSION CLEANUP INITIATIVE

This script automates the process of managing GitHub Discussions by adding comments and closing outdated discussions.

## Features
Fetches discussions from a specified GitHub repository.
Adds a customizable closing comment to outdated discussions.
Closes discussions that meet specified criteria (e.g., unanswered, outdated).


## Prerequisites
Node.js installed on your machine.
A GitHub Personal Access Token (PAT) with the necessary permissions to access discussions.

## Setup

1. Clone this repository to your local machine.
```
git clone https://github.com/ludralph/Github-discussion-cleanup
```

2. Navigate to the project directory.
```bash
cd github-discussion-script
```

3. Install dependencies.
```bash
npm install
```

4. Create a .env file in the project root and add your GitHub token.
```bash
GITHUB_TOKEN=your_github_personal_access_token
```
Note: Replace your_github_personal_access_token with your actual GitHub token.

5. Ensure the script.mts file contains the correct repository owner and name:
```ts
const REPO_OWNER = 'prisma'; // Replace with your repository owner
const REPO_NAME = 'prisma';  // Replace with your repository name
```

## Running the Script
```
npm run dev
```

The script will:

1. Fetch discussions from the specified repository.
2. Add a closing comment and close discussions that meet the criteria.

##  Dependencies
- @octokit/graphql
- dotenv
- tsx
- typescript
