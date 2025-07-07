import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/config/baseUrl';
import Cookies from 'js-cookie';

const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('token') : null,
  isAuthenticated: false,
  role: null,
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
      
      if (response.data.status && response.data.items) {
        const { user, token } = response.data.items;
        
        // Store token in both localStorage and cookies
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
        
        // Verify user after successful login
        const verifyResponse = await dispatch(verifyUser(token)).unwrap();
        console.log('verifyUser response in login thunk:', verifyResponse);
        
        return {
          user: verifyResponse.items || user,
          token: token,
          role: (verifyResponse.items && verifyResponse.items.role) || user.role,
          message: response.data.message
        };
      }
      return rejectWithValue({ message: response.data.message || 'Login failed' });
    } catch (error) {
      console.log('Login error:', error.response?.data);
      if (error.response?.data) {
        return rejectWithValue({ 
          message: error.response.data.message || 'Login failed' 
        });
      }
      return rejectWithValue({ message: 'Login failed' });
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
      
      console.log('Register response:', response.data);
      
      // Check for successful registration (new format)
      if (response.data.status === true && response.data.items && response.data.items.user) {
        const user = response.data.items.user;
        
        return {
          user: user,
          message: response.data.message || 'Registration successful! Please check your email to verify your account.'
        };
      }
      
      // If we reach here, something went wrong
      return rejectWithValue({ 
        message: response.data.message || 'Registration failed' 
      });
    } catch (error) {
      console.log('Register error:', error.response?.data);
      // Handle different error response formats
      if (error.response?.data) {
        return rejectWithValue({ 
          message: error.response.data.message || 'Registration failed' 
        });
      }
      return rejectWithValue({ message: 'Registration failed' });
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
        headers: { Authorization: token }
      });
      
      console.log('getCurrentUser response:', response.data);
      
      // Return the response data as is - the reducer will handle the format
      return response.data;
    } catch (error) {
      console.log('getCurrentUser error:', error.response?.data);
      if (error.response?.data) {
        return rejectWithValue({ 
          message: error.response.data.message || 'Failed to get user data' 
        });
      }
      return rejectWithValue({ message: 'Failed to get user data' });
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue, dispatch }) => {
    try {
      // Verify user after successful Google login
      const verifyResponse = await dispatch(verifyUser(token)).unwrap();
      
      // Get user data using the token
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: token }
      });
      
      return {
        user: response.data,
        token: token,
        message: 'Google login successful!'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Google login failed' });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/forgotPassword`, {
        email: email
      });
      
      return {
        message: response.data.message || 'Password reset email sent successfully'
      };
    } catch (error) {
      console.log('Forgot password error:', error.response?.data);
      if (error.response?.data) {
        return rejectWithValue({ 
          message: error.response.data.message || 'Failed to send reset email' 
        });
      }
      return rejectWithValue({ message: 'Failed to send reset email' });
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/resetPassword/${token}`, {
        password: password
      });
      
      return {
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.log('Reset password error:', error.response?.data);
      if (error.response?.data) {
        return rejectWithValue({ 
          message: error.response.data.message || 'Failed to reset password' 
        });
      }
      return rejectWithValue({ message: 'Failed to reset password' });
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
      state.role = null;
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
        console.log('verifyUser.fulfilled payload:', action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
        state.user = action.payload.items;
        state.role = action.payload.items?.role;
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
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.role = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Don't authenticate user yet - they need to verify email first
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
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
        state.role = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.items;
        state.role = action.payload.items?.role;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get user data';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // Clear invalid tokens
        localStorage.removeItem('token');
        Cookies.remove('token');
        console.log('getCurrentUser rejected - cleared tokens');
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Google login failed';
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send reset email';
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reset password';
      });
  },
});

export const { clearError, resetState } = authSlice.actions;
export default authSlice.reducer; 