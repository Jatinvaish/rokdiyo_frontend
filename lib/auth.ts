import { authService } from "./services/auth.service";

export const logout = async () => {
  await authService.logout();
};