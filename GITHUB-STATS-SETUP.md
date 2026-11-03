# Connect GitHub statistics

The homepage shows the number of published portfolio projects from Firestore.
The two GitHub counters use `/api/github-stats`, a server-only Vercel function.
They show owned repositories and contributions from January 1 of the current UTC
year to now. Counts include private activity that the configured token can see;
they are not a count of completed products or just commits.

## One-time connection

1. Sign in to GitHub as **maskid111**. Create a fine-grained personal access token
   at https://github.com/settings/personal-access-tokens/new.
2. Choose **maskid111** as the resource owner and **All repositories** so newly
   created and private repositories can be counted automatically. Start with
   the automatically included **Metadata: Read-only** permission. No write
   permission is needed. Set an expiration date you can maintain.
3. In Vercel, open this portfolio project → Settings → Environment Variables.
   Add **GITHUB_STATS_TOKEN** with that token as a sensitive server-side value
   for Production (and Preview if you want preview deployments to show counts).
4. Redeploy the portfolio. Open `/api/github-stats` on your deployed domain.
   A working connection returns only `repositoryCount`,
   `contributionsThisYear`, `year`, and `updatedAt`.
5. Check the totals against your GitHub account. Tokens are limited to their
   granted repository access, and organization restrictions can affect counts.
   To include anonymous contributions to repositories outside that access,
   enable **Private contributions** in your GitHub profile's contribution
   settings. GitHub can take time to credit new contributions.

Do not put the token in `dist`, browser JavaScript, Firebase documents, Git, or
chat. The endpoint never asks GitHub for repository names, files, commit bodies,
or messages and never sends the token or raw GitHub responses to visitors.
The token must belong to maskid111; other accounts are rejected.

## Refreshing and local testing

The browser refreshes the GitHub counters every five minutes while visible and
when you return to the tab. Vercel caches successful aggregate responses for up
to five minutes. GitHub's own contribution processing may add further delay.
No scheduled job or paid storage is required. Expired or missing tokens show
unavailable values, never fabricated totals.

For local testing, set `GITHUB_STATS_TOKEN` only in your terminal's environment
before running `npm start`. The local server serves the same API function.
An existing preview server must be restarted after setting the variable.

References:
- https://docs.github.com/en/graphql/reference/users
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/showing-private-contributions-and-achievements
