export type PairState = "none" | "pending" | "paired";

export type Partner = {
  id: string;
  email: string | null;
  timezone: string | null;
};

export type PairRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  status: string;
};

export type PartnerSummaryDay = {
  date: string;
  dayClosed: boolean;
  oneThingDone: boolean;
  reflectionPresent: boolean;
};

export type PartnerStatusViewModel = {
  dayClosed: boolean | null;
  oneDone: boolean | null;
  reflectionDone: boolean | null;
  streak: number;
};

export type Checkin = {
  id: string;
  authorUserId: string;
  authorEmail: string | null;
  targetDate: string;
  message: string;
  createdAt: string;
};
