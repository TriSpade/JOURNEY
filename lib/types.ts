export type UserIdentity = {
  id: number;
  username: string;
  displayName: string;
};

export type Reaction = {
  emoji: string;
  count: number;
  users: string[];
  reactedByMe: boolean;
};

export type JourneyMessage = {
  id: number;
  body: string;
  createdAt: string;
  user: UserIdentity;
};

export type Destination = {
  id: number;
  title: string;
  location: string;
  plannedDate: string | null;
  status: "wishlist" | "planned" | "visited";
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: UserIdentity;
  reactions: Reaction[];
  messages: JourneyMessage[];
};
