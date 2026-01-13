import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchGigs = createAsyncThunk(
  "gigs/fetchGigs",
  async (searchQuery = "", { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/gigs?search=${searchQuery}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchGigById = createAsyncThunk(
  "gigs/fetchGigById",
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/gigs/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGig = createAsyncThunk(
  "gigs/createGig",
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/gigs", gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGig = createAsyncThunk(
  "gigs/updateGig",
  async ({ gigId, gigData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/gigs/${gigId}`, gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGig = createAsyncThunk(
  "gigs/deleteGig",
  async (gigId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/gigs/${gigId}`);
      return gigId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const gigSlice = createSlice({
  name: "gigs",
  initialState: {
    gigs: [],
    currentGig: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to fetch gigs";
      })
      // Fetch gig by ID
      .addCase(fetchGigById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGigById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGigById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to fetch gig";
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs.unshift(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message || "Failed to create gig";
      })
      // Update gig
      .addCase(updateGig.fulfilled, (state, action) => {
        const index = state.gigs.findIndex(
          (gig) => gig._id === action.payload._id
        );
        if (index !== -1) {
          state.gigs[index] = action.payload;
        }
        if (state.currentGig && state.currentGig._id === action.payload._id) {
          state.currentGig = action.payload;
        }
      })
      // Delete gig
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.gigs = state.gigs.filter((gig) => gig._id !== action.payload);
        if (state.currentGig && state.currentGig._id === action.payload) {
          state.currentGig = null;
        }
      });
  },
});

export const { clearError, clearCurrentGig } = gigSlice.actions;
export default gigSlice.reducer;
