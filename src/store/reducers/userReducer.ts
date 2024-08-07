import {
  getMineTokenIdsOf,
  getMineTokenTypeIds,
  getMineTotalSupply,
} from "@/lib/contracts/mine";
import {
  getStakedTokenIdsOf,
  getStakePositions,
} from "@/lib/contracts/staking";
import { IStakePosition, IUserLock } from "@/types";
import { LoadingStatus } from "@/types/enums";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { getMinerBalancesOf } from "@/lib/contracts/miner";
import { Address } from "viem";
import { ContractABIs } from "@/config/constants";
import { getFrostStakingUserLocks } from "@/lib/contracts/frost-staking-pool";

export interface UserState {
  value: number;
  mines: {
    data: IStakePosition[];
    status: LoadingStatus;
  };
  miners: {
    balances: number[];
    status: LoadingStatus;
  };
  stakePositions: {
    data: IStakePosition[];
    status: LoadingStatus;
  };
  userLocks: {
    data: IUserLock[];
    status: LoadingStatus;
  };
}

const initialState: UserState = {
  value: 0,
  mines: {
    data: [],
    status: LoadingStatus.NotStarted,
  },
  miners: {
    balances: new Array(7).fill(0),
    status: LoadingStatus.NotStarted,
  },
  stakePositions: {
    data: [],
    status: LoadingStatus.NotStarted,
  },
  userLocks: {
    data: [],
    status: LoadingStatus.NotStarted,
  },
};

export const loadFrostStakingUserLocksThunk = createAsyncThunk(
  "loadFrostStakingUserLocksThunk",
  async (
    { address, poolAddresses }: { address?: Address; poolAddresses: Address[] },
    { rejectWithValue, dispatch }
  ) => {
    if (!address) {
      return [] as IUserLock[];
    }
    try {
      const userLocks = await getFrostStakingUserLocks(address, poolAddresses);
      return userLocks;
    } catch (error) {
      console.error("loadFrostStakingUserLocksThunk", error);
      return rejectWithValue(error);
    }
  }
);

export const loadUserStakePositionsThunk = createAsyncThunk(
  "loadUserStakePositionsThunk",
  async (
    { address, tokenIds }: { address?: string; tokenIds?: number[] },
    { rejectWithValue, getState }
  ) => {
    try {
      if (!address) {
        return [];
      }

      if (tokenIds === undefined) {
        tokenIds = await getStakedTokenIdsOf(address);
      }

      return await getStakePositions(tokenIds);
    } catch (error) {
      console.error("loadUserStakePositionsThunk", error);
      return rejectWithValue("");
    }
  }
);

export const loadUserMinesThunk = createAsyncThunk(
  "loadUserMinesThunk",
  async (
    { address, tokenIds }: { address?: string; tokenIds?: number[] },
    { rejectWithValue, getState }
  ) => {
    try {
      if (!address) {
        return [];
      }

      if (tokenIds === undefined) {
        tokenIds = await getMineTokenIdsOf(address);
      }
      const tokenTypes = await getMineTokenTypeIds(tokenIds);
      const stakingPositions = await getStakePositions(tokenIds);

      const prices = (getState() as RootState).app.mineInfo;

      stakingPositions.forEach((p, i) => {
        if (p.nftType === 0) {
          p.nftType = tokenTypes[i];
          p.user = address;
          p.tokenId = tokenIds ? tokenIds[i] : 0;
          p.buyPrice = prices[tokenTypes[i]].price;
        }
      });

      return stakingPositions;
    } catch (error) {
      console.error("loadUserMinesThunk", error);
      return rejectWithValue("");
    }
  }
);

export const loadUserMinerBalancesThunk = createAsyncThunk(
  "loadUserMinerBalancesThunk",
  async (
    { address, tokenIds }: { address: string | undefined; tokenIds?: number[] },
    { rejectWithValue }
  ) => {
    try {
      if (!address) {
        return [];
      }
      const balances = await getMinerBalancesOf(address, tokenIds);
      return balances;
    } catch (error) {
      console.error("loadUserMinerBalancesThunk", error);
      return rejectWithValue("");
    }
  }
);

export const addNewMinesThunk = createAsyncThunk(
  "addNewMinesThunk",
  async (
    { cnt, typeId, address }: { cnt: number; typeId: number; address: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const price = (getState() as RootState).app.mineInfo[typeId].price;
      const totalSupply = await getMineTotalSupply();
      return new Array(cnt).fill(0).map(
        (_, i): IStakePosition => ({
          user: address,
          nftType: typeId,
          tokenId: totalSupply - i,
          buyPrice: price,
          stakedTimestamp: 0,
          latestClaimedTimestamp: 0,
          latestLpr: 10000,
          claimedRewards: 0,
          isStaked: false,
        })
      );
    } catch (error) {
      console.error("addNewMinesThunk");
      return rejectWithValue("");
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    removeNFTs: (state, action: PayloadAction<number[]>) => {
      state.mines.data = state.mines.data.filter(
        (n) => !action.payload.includes(n.tokenId)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserMinesThunk.pending, (state) => {
        state.mines.status = LoadingStatus.Loading;
      })
      .addCase(loadUserMinesThunk.fulfilled, (state, action) => {
        action.payload.forEach((s) => {
          const tokenIds = state.mines.data.map((s) => s.tokenId);
          if (tokenIds.includes(s.tokenId)) {
            state.mines.data = state.mines.data.filter(
              (d) => d.tokenId !== s.tokenId
            );
          }
          state.mines.data.push(s);
        });
        // state.mines.data = action.payload;
        state.mines.status = LoadingStatus.Fulfilled;
      })
      .addCase(loadUserMinesThunk.rejected, (state) => {
        state.mines.status = LoadingStatus.Failed;
      });

    builder.addCase(addNewMinesThunk.fulfilled, (state, action) => {
      state.mines.data.push(...action.payload);
    });

    builder.addCase(loadUserMinerBalancesThunk.fulfilled, (state, action) => {
      const balances = action.payload;
      balances.forEach((balance) => {
        state.miners.balances[balance.tokenId] = balance.balance;
      });
    });

    builder
      .addCase(loadUserStakePositionsThunk.pending, (state) => {
        state.stakePositions.status = LoadingStatus.Loading;
      })
      .addCase(loadUserStakePositionsThunk.fulfilled, (state, action) => {
        action.payload.forEach((s) => {
          const tokenIds = state.stakePositions.data.map((s) => s.tokenId);
          if (tokenIds.includes(s.tokenId)) {
            state.stakePositions.data = state.stakePositions.data.filter(
              (d) => d.tokenId !== s.tokenId
            );
          }
          state.stakePositions.data.push(s);
        });
      });

    builder.addCase(
      loadFrostStakingUserLocksThunk.fulfilled,
      (state, action) => {
        state.userLocks.data = action.payload;
      }
    );
  },
});

// Action creators are generated for each case reducer function
export const { removeNFTs } = userSlice.actions;

const userReducer = userSlice.reducer;

export default userReducer;
