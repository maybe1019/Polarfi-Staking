import { MinerTypeCount, MineTypeCount } from "@/config/constants";
import { getFrostStakingPools } from "@/lib/contracts/frost-staking";
import { getMineInfo } from "@/lib/contracts/mine";
import { getMinerInfo } from "@/lib/contracts/miner";
import { IMineInfo, IMinerInfo, IStakingPool } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  mineInfo: IMineInfo[];
  minerInfo: IMinerInfo[];
  frostStakingPools: IStakingPool[];
}

const initialState: AppState = {
  mineInfo: new Array(MineTypeCount + 1)
    .fill(0)
    .map((_, i) => ({ amountForSale: 0, price: 0, typeId: i })),
  minerInfo: new Array(MinerTypeCount + 1)
    .fill(0)
    .map((_, i) => ({ price: 0, typeId: i, repairRate: 10 })),
  frostStakingPools: [],
};

export const loadMinerInfoThunk = createAsyncThunk(
  "loadMinerInfoThunk",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMinerInfo();
      return res;
    } catch (error) {
      console.error("loadMinerInfoThunk", error);
      return rejectWithValue("");
    }
  }
);

export const loadMineInfoThunk = createAsyncThunk(
  "loadMineInfoThunk",
  async (typeIds: number[], { rejectWithValue }) => {
    try {
      if (typeIds.length === 0) {
        typeIds.push(...new Array(MineTypeCount + 1).fill(0).map((_, i) => i));
      }

      return await getMineInfo(typeIds);
    } catch (error) {
      console.error("loadMineInfoThunk", error);
      return rejectWithValue(error);
    }
  }
);

export const loadFrostStakingPoolsThunk = createAsyncThunk(
  "loadFrostStakingPools",
  async (_, { rejectWithValue }) => {
    try {
      return await getFrostStakingPools();
    } catch (error) {
      console.error("loadFrostStakingPools", error);
      return rejectWithValue(error);
    }
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMineInfoThunk.fulfilled, (state, action) => {
      action.payload.forEach((info) => {
        state.mineInfo[info.typeId] = info;
      });
    });

    builder.addCase(loadMinerInfoThunk.fulfilled, (state, action) => {
      state.minerInfo = action.payload;
    });

    builder.addCase(loadFrostStakingPoolsThunk.fulfilled, (state, action) => {
      state.frostStakingPools = action.payload;
    })
  },
});

// Action creators are generated for each case reducer function
export const {} = appSlice.actions;

const appReducer = appSlice.reducer;

export default appReducer;
