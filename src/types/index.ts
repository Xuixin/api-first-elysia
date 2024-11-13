// src/types.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface JWTInstance {
  sign: (payload: Record<string, any>) => Promise<string>;
  verify: (token: string) => Promise<any>;
}

// ถ้าต้องการกำหนด type ของ payload ที่ได้จาก verify
export interface JWTPayload {
  email: string;
  userId: string;
  iat?: number;
  exp?: number;
}

export interface LoginContext {
  body: LoginRequest;
  jwt: JWTInstance;
}

// Optional: interface สำหรับ auth middleware
export interface AuthContext {
  request: Request;
  set: {
    status: number;
    headers: Record<string, string>;
  };
  jwt: JWTInstance;
}
