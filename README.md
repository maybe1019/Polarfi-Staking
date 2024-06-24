This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

## Routing
- `/migration`  
This page is used to show legacy node balances for user
- `/migration/burn`  
This page is used to select legacy node to burn nodes so that users can get points to migrate new rev nfts on destination chain.  
User must pay cost with `$USDT`.
- `/migration/select-node`  
This page is used to select revenue node to be minted on destination chain.
- `/dashboard`  
This page is to show current revenue nodes balance of user.  
Users can browser his nodes and claim pending rewards.