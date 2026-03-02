import { apiFetch, type ApiError } from "@/lib/api";
import type { Checkin, PairRequest, Partner, PartnerSummaryDay } from "./types";

type PartnerResponse = {
  partner: Partner | null;
};

type PairRequestsResponse = {
  requests: PairRequest[];
};

type PairRequestResponse = {
  request: PairRequest;
};

type PartnerSummaryResponse = {
  summary: PartnerSummaryDay[];
};

type CheckinsResponse = {
  checkins: Checkin[];
};

type CheckinResponse = {
  checkin: Checkin;
};

type RequestPairPayload = {
  toUserEmail: string;
};

function asError(error: ApiError): Error {
  return new Error(error.message || "Er ging iets mis.");
}

export async function getPartner(): Promise<Partner | null> {
  const response = await apiFetch<PartnerResponse>("/accountability/partner");
  if (!response.success) {
    throw asError(response);
  }
  return response.data.partner;
}

export async function getPairRequests(): Promise<PairRequest[]> {
  const response = await apiFetch<PairRequestsResponse>("/accountability/requests");
  if (!response.success) {
    throw asError(response);
  }
  return response.data.requests;
}

export async function requestPairByEmail(email: string): Promise<PairRequest> {
  const payload: RequestPairPayload = { toUserEmail: email.trim() };
  const response = await apiFetch<PairRequestResponse>("/accountability/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.success) {
    throw asError(response);
  }
  return response.data.request;
}

export async function acceptPairRequest(requestId: string): Promise<void> {
  const response = await apiFetch<{ pair: { pairId: string; partnerId: string } }>(
    `/accountability/requests/${encodeURIComponent(requestId)}/accept`,
    { method: "POST" },
  );
  if (!response.success) {
    throw asError(response);
  }
}

export async function rejectPairRequest(requestId: string): Promise<void> {
  const response = await apiFetch<{ rejected: boolean }>(
    `/accountability/requests/${encodeURIComponent(requestId)}/reject`,
    { method: "POST" },
  );
  if (!response.success) {
    throw asError(response);
  }
}

export async function getPartnerSummary(startDate: string, endDate: string): Promise<PartnerSummaryDay[]> {
  const query = new URLSearchParams({ startDate, endDate });
  const response = await apiFetch<PartnerSummaryResponse>(`/accountability/partner/summary?${query.toString()}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data.summary;
}

export async function getCheckins(startDate: string, endDate: string): Promise<Checkin[]> {
  const query = new URLSearchParams({ startDate, endDate });
  const response = await apiFetch<CheckinsResponse>(`/accountability/checkins?${query.toString()}`);
  if (!response.success) {
    throw asError(response);
  }
  return response.data.checkins;
}

export async function createCheckin(message: string): Promise<Checkin> {
  const response = await apiFetch<CheckinResponse>("/accountability/checkin", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  if (!response.success) {
    throw asError(response);
  }
  return response.data.checkin;
}
