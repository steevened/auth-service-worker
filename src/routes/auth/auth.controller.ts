import { Context } from "hono";
import { RawResponse } from "../../types";
import * as service from "./auth.service";

export const requestLoginOtp = async (c: Context): Promise<RawResponse> => {
  return await service.requestLoginOtp(c);
};

export const validateLoginOtp = async (c: Context): Promise<RawResponse> => {
  return await service.validateLoginOtp(c);
};
