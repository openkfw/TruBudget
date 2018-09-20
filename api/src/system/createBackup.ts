import {
  AuthenticatedRequest,
  HttpResponse,
} from "../httpd/lib";
import axios, { AxiosInstance, AxiosError } from "axios";


export const createBackup = async (
  req: AuthenticatedRequest,
) => {
  const mcHost = process.env.RPC_HOST
  const response = await axios.get(`http://${mcHost}:8085/chain`)
  return response.data;
};
