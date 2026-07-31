import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const DEFAULT_BASE_URL = 'https://towy-backend.vercel.app';

function getBaseUrl(): string {
  const fromPublic =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL
      ? String(process.env.EXPO_PUBLIC_API_BASE_URL).replace(/\/$/, '')
      : '';
  if (fromPublic) return fromPublic;
  const extras = (Constants?.expoConfig as any)?.extra || (Constants?.manifest as any)?.extra;
  const fromExtra = extras?.API_BASE_URL ? String(extras.API_BASE_URL).replace(/\/$/, '') : '';
  return fromExtra || DEFAULT_BASE_URL;
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || (error.response?.data as any)?.error || error.message;
    return Promise.reject(new Error(message || 'Request failed'));
  }
);

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'provider';
  latitude?: number;
  longitude?: number;
  businessName?: string;
};

export async function signup(payload: SignupPayload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export async function login(payload: { email: string; password: string; role?: 'customer' | 'provider' }) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
}

// Service Request Types
export type ServiceType = 
  | 'towing'
  | 'roadside_assistance'
  | 'vehicle_recovery'
  | 'battery_jump'
  | 'tire_change'
  | 'gas_delivery'
  | 'lockout'
  | 'mechanic';

export type CreateServiceRequestPayload = {
  serviceType: ServiceType;
  location?: string;
  coordinates: { lat: number; lng: number } | string;
  description?: string;
  vehicleType?: string;
};

export type ServiceRequest = {
  id: string;
  serviceType: string;
  location: string;
  coordinates?: string | { lat: number; lng: number };
  description?: string;
  vehicleType?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  providerId?: string;
  quotedPrice?: number;
};

export type NearbyProvider = {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  services: string[];
  distance: number;
  isAvailable: boolean;
};

export type VoiceParseConfidence = 'high' | 'medium' | 'low' | 'none';

export type VoiceParseResult = {
  serviceType: ServiceType | null;
  confidence: VoiceParseConfidence;
  transcript: string;
  description: string;
  matchedKeywords: string[];
};

// Create a new service request
export async function createServiceRequest(payload: CreateServiceRequestPayload): Promise<ServiceRequest> {
  const { data } = await api.post('/services/request', payload);
  return data.service;
}

// Get nearby providers
export async function getNearbyProviders(params: {
  latitude: number;
  longitude: number;
  radius: number;
  serviceType: ServiceType;
}): Promise<NearbyProvider[]> {
  const { data } = await api.get('/services/nearby-providers', {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      serviceType: params.serviceType,
    },
  });
  return data || [];
}

/** Normalize list responses whether the API returns a bare array or a wrapper. */
export function normalizeServiceRequestList(data: unknown): ServiceRequest[] {
  if (Array.isArray(data)) return data as ServiceRequest[];
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.requests)) return o.requests as ServiceRequest[];
    if (Array.isArray(o.data)) return o.data as ServiceRequest[];
  }
  return [];
}

// Get user's service requests
export async function getUserRequests(): Promise<ServiceRequest[]> {
  const { data } = await api.get('/services/user-requests');
  return normalizeServiceRequestList(data);
}

// Get a single service request by ID
export async function getServiceRequest(requestId: string): Promise<ServiceRequest> {
  const { data } = await api.get(`/services/request/${requestId}`);
  return data;
}

export type ServiceRequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | string;

/** PATCH /services/request/:id/status — body: { status } */
export async function updateRequestStatus(
  requestId: string,
  status: ServiceRequestStatus
): Promise<ServiceRequest> {
  const { data } = await api.patch(`/services/request/${requestId}/status`, { status });
  return data.service ?? data;
}

// Parse a voice transcript into a draft service request (lightweight demo endpoint)
export async function parseVoiceTranscript(transcript: string): Promise<VoiceParseResult> {
  const { data } = await api.post('/services/voice/parse', { transcript });
  return data;
}

