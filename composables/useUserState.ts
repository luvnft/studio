export interface User {
  sid: string;
  userId: string;
  address: string;
  username: string | null;
  email: string | null;
  email_to_verify: string | null;
  email_verified: boolean;
  email_verification_token_expires_at: Date | null;
  email_verification_sent_at: Date | null;
  avatar: string | null;
  cover: string | null;
  beta_features: string;
}

export const useUserState = () => {
  const user = useState<User | null>("user", () => null);
  return user
}