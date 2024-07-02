export enum AppModes {
  Production = "prod",
  Development = "dev",
}

export interface IMineToken {
  tokenId: number;
  typeId: number;
}

export interface IStakePosition {
  user: string;
  nftType: number;
  tokenId: number;
  buyPrice: number;
  stakedTimestamp: number;
  latestClaimedTimestamp: number;
  latestLpr: number;
  claimedRewards: number;
  isStaked: boolean;
}

export interface IStakeReward {
  tokenId: number;
  reward: number;
  currentLPR: number;
}

export interface IMineInfo {
  typeId: number;
  price: number;
  amountForSale: number;
}

export interface IMinerInfo {
  typeId: number;
  price: number;
}
