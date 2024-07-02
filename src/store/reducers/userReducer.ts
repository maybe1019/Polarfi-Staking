import {
  getMineTokenIdsOf,
  getMineTokenTypeIds,
  getMineTotalSupply,
} from "@/lib/contracts/mine";
import { getStakePositions } from "@/lib/contracts/staking";
import { IStakePosition } from "@/types";
import { LoadingStatus } from "@/types/enums";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { getMinerBalancesOf } from "@/lib/contracts/miner";

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
};

export const loadUserMinesThunk = createAsyncThunk(
  "loadUserMinesThunk",
  async (address: string | undefined, { rejectWithValue, getState }) => {
    try {
      if (!address) {
        return [];
      }

      const tokenIds = await getMineTokenIdsOf(address);
      const tokenTypes = await getMineTokenTypeIds(tokenIds);
      const stakingPositions = await getStakePositions(tokenIds);

      const prices = (getState() as RootState).app.mineInfo;

      stakingPositions.forEach((p, i) => {
        if (p.nftType === 0) {
          p.nftType = tokenTypes[i];
          p.user = address;
          p.tokenId = tokenIds[i];
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
      console.log(balances);
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
          tokenId: totalSupply + i + 1,
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserMinesThunk.pending, (state) => {
        state.mines.status = LoadingStatus.Loading;
      })
      .addCase(loadUserMinesThunk.fulfilled, (state, action) => {
        state.mines.data = action.payload;
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
  },
});

// Action creators are generated for each case reducer function
export const {} = userSlice.actions;

const userReducer = userSlice.reducer;

export default userReducer;
