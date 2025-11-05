import axios, { AxiosError } from "axios";

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// -------------------- Types --------------------
export type Status = "BUSY" | "SWAPPABLE" | "SWAP_PENDING";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  password?: string;
}

export interface Event {
  eventId: number;
  userId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: Status;
}

export interface SwapRequest {
  requestId: number;
  requestorId: number;
  targetUserId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: Status;
}

export interface RequestDTO {
  requestorId: number;
  targetUserId: number;
}

export interface MarkRequestDTO {
  status: Status;
}

export interface StatusUpdateDTO {
  acceptanceStatus: boolean;
  swapRequestId: number;
}

// -------------------- Axios Client --------------------
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const publicPaths = ["/users", "/users/login", "/users/register"];

  if (!publicPaths.some((path) => config.url?.startsWith(path)) && token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

// -------------------- API Methods --------------------
export const api = {
  // --------- Auth ---------
  async signup(user: Omit<AppUser, "id">): Promise<AppUser> {
    const response = await apiClient.post("/users", user);
    return response.data;
  },

  async login(email: string, password: string): Promise<{ token: string; id: number; email: string; name: string }> {
    const response = await apiClient.post("/users/login", { email, password });
    const data = response.data;
    localStorage.setItem("token", data.token);
    return data;
  },

  // --------- Events ---------
  async getSwappableEvents(userId: number): Promise<Event[]> {
    const response = await apiClient.get(`/events/swappable/${userId}`);
    return response.data;
  },

  async getUserEvents(userId: number): Promise<Event[]> {
    const response = await apiClient.get(`/events/user-events/${userId}`);
    return response.data;
  },

  async createEvent(event: Omit<Event, "eventId">): Promise<Event> {
    const response = await apiClient.post(`/events/create-event`, event);
    return response.data;
  },

  async markEvent(eventId: number, status: Status): Promise<string> {
    const response = await apiClient.post(`/events/mark-event/${eventId}`, { status });
    return response.data;
  },

  async updateEvent(event: Event): Promise<Event> {
    const response = await apiClient.put(`/events/update-event`, event);
    return response.data;
  },

  // --------- Swap Requests ---------
  async getSwapRequests(userId: number): Promise<SwapRequest[]> {
    const response = await apiClient.get(`/events/swap-requests/${userId}`);
    return response.data;
  },

  async placeSwapRequest(requestDTO: RequestDTO): Promise<string> {
    try {
      const response = await apiClient.post(`/events/swap-request`, requestDTO);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error("Failed to place swap request:", error.response?.data || error.message);
      throw error;
    }
  },

  async processRequest(statusUpdateDTO: StatusUpdateDTO): Promise<string> {
    const response = await apiClient.post(`/events/process-request`, statusUpdateDTO);
    return response.data;
  },
};
