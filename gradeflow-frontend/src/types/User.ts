export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
}
