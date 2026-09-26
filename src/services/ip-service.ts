import axios from "axios";

export type IpInfo = {
  ip: string; version: number; country: string | null; countryCode: string | null;
  region: string | null; city: string | null; postal: string | null;
  latitude: number | null; longitude: number | null; timezone: string | null;
  isp: string | null; organization: string | null; asn: string | null; asName: string | null;
  continent: string | null; hostname?: string | null;
  security?: { vpn: boolean | null; proxy: boolean | null; tor: boolean | null; hosting: boolean | null; type: string | null; proxyType: string | null; confidence: number | null };
};

export const ipClient = axios.create({ baseURL: "/api", timeout: 15000, headers: { Accept: "application/json" } });
ipClient.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && !error.response) {
    return Promise.reject(new Error("NETWORK_REQUEST_FAILED"));
  }
  return Promise.reject(error);
});

export async function fetchIpInfo(ip?: string, security = false): Promise<IpInfo> {
  const { data } = await ipClient.get<IpInfo>("/ip", { params: { ...(ip ? { ip } : {}), ...(security ? { security: "1" } : {}) } });
  return data;
}
