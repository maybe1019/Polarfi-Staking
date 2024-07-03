import { getMineInfo } from "@/lib/contracts/mine";
import { getMinerInfo } from "@/lib/contracts/miner";
import { IMineInfo, IMinerInfo } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  mineInfo: IMineInfo[];
  minerInfo: IMinerInfo[];
  repairRate: number;
}

const initialState: AppState = {
  mineInfo: new Array(7)
    .fill(0)
    .map((_, i) => ({ amountForSale: 0, price: 0, typeId: i })),
  minerInfo: new Array(7).fill(0).map((_, i) => ({ price: 0, typeId: i })),
  repairRate: 10,
};

export const loadMinerInfoThunk = createAsyncThunk(
  "loadAllInfoThunk",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMinerInfo();
      return res;
    } catch (error) {
      console.error("loadAllInfoThunk", error);
      return rejectWithValue("");
    }
  }
);

export const loadMineInfoThunk = createAsyncThunk(
  "loadMineInfoThunk",
  async (typeIds: number[], { rejectWithValue }) => {
    try {
      if (typeIds.length === 0) {
        typeIds.push(0, 1, 2, 3, 4, 5, 6);
      }

      return await getMineInfo(typeIds);
    } catch (error) {
      console.error("loadMineInfoThunk", error);
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
      state.minerInfo = action.payload.prices;
      state.repairRate = action.payload.repairRate;
    });
  },
});

// Action creators are generated for each case reducer function
export const {} = appSlice.actions;

const appReducer = appSlice.reducer;

export default appReducer;
