import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const submitBid = createAsyncThunk(
  "bids/submitBid",
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/bids", bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchBidsForGig = createAsyncThunk(
  "bids/fetchBidsForGig",
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/bids/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const hireFreelancer = createAsyncThunk(
  "bids/hireFreelancer",
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/bids/${bidId}/hire`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectBid = createAsyncThunk(
  "bids/rejectBid",
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/bids/${bidId}/reject`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  "bids/fetchMyBids",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/bids/user/my-bids");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bidSlice = createSlice({
  name: "bids",
  initialState: {
    bids: [],
    myBids: [],
    isLoading: false,
    error: null,
    notifications: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification, index) => index !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids.unshift(action.payload);
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to submit bid";
      })
      // Fetch bids for gig
      .addCase(fetchBidsForGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to fetch bids";
      })
      // Hire freelancer
      .addCase(hireFreelancer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hireFreelancer.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the bid status in the bids array
        const bidIndex = state.bids.findIndex(
          (bid) => bid._id === action.payload.bid._id
        );
        if (bidIndex !== -1) {
          state.bids[bidIndex] = action.payload.bid;
        }
        // Update other bids to rejected
        state.bids = state.bids.map((bid) =>
          bid.gigId === action.payload.bid.gigId &&
          bid._id !== action.payload.bid._id
            ? { ...bid, status: "rejected" }
            : bid
        );
      })
      .addCase(hireFreelancer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to hire freelancer";
      })
      // Reject bid
      .addCase(rejectBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the bid status in the bids array
        const bidIndex = state.bids.findIndex(
          (bid) => bid._id === action.payload.bid._id
        );
        if (bidIndex !== -1) {
          state.bids[bidIndex] = action.payload.bid;
        }
      })
      .addCase(rejectBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to reject bid";
      })
      // Fetch my bids
      .addCase(fetchMyBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to fetch your bids";
      });
  },
});

export const {
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
} = bidSlice.actions;
export default bidSlice.reducer;
