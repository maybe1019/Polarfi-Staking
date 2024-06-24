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