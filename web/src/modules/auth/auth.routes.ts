import {
  loginController,
  logoutController,
  registerController,
  sessionController,
} from './auth.controller';

export const authRouteHandlers = {
  login: loginController,
  register: registerController,
  logout: logoutController,
  session: sessionController,
};
