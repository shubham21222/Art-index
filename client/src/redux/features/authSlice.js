import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/config/baseUrl';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('token') : null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Verification failed' });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.status && response.data.items.token) {
        const token = response.data.items.token;
        // Store token in both localStorage and cookies
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
        
        // Verify user after successful login
        const verifyResponse = await dispatch(verifyUser(token)).unwrap();
        
        return {
          user: response.data.items.user,
          token: token,
          message: response.data.message
        };
      }
      return rejectWithValue({ message: response.data.message || 'Login failed' });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: "USER"
      });
      
      if (response.data.success && response.data.token) {
        const token = response.data.token;
        // Store token in both localStorage and cookies
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
        
        return {
          user: response.data.user,
          token: token,
          message: 'Registration successful!'
        };
      }
      return rejectWithValue({ message: 'Registration failed' });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: { 
          'Authorization': token
        }
      });
      
      // Remove token from both localStorage and cookies
      localStorage.removeItem('token');
      Cookies.remove('token');
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Logout failed' });
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify User
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Verification failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        Cookies.remove('token');
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get user data';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
        Cookies.remove('token');
      });
  },
});

export const { clearError, resetState } = authSlice.actions;
export default authSlice.reducer; 