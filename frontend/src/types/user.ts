// src/types/user.ts

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  // Add any other fields your UserSerializer exposes
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user?: User; // Optionally include user details upon login/refresh
}

export interface LoginCredentials {
  // USERNAME_FIELD in Django is 'username' by default for AbstractUser.
  // Simple JWT's TokenObtainPairView expects this field.
  username: string; // This will hold the email input from the form
  password: string; // Password is required for login.
  // email?: string; // No longer primary for the payload key, but can be an alias if backend is customized
}

export interface RegisterData {
  username: string;
  email: string;
  password?: string;  // Password will be sent
  password2?: string; // Password confirmation
  first_name?: string;
  last_name?: string;
}

export interface Address {
    id: number;
    user: number; // User ID
    street_address: string;
    apartment_address?: string;
    city: string;
    state_province?: string;
    postal_code: string;
    country: string;
    address_type: 'BILLING' | 'SHIPPING';
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}
