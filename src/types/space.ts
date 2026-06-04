export type SpaceType = "official" | "business" | "user" | "event";
export type UserType = "explorer" | "owner";
export type Visibility = "public" | "gwandang" | "private";

export interface Space {
  id: string;
  type: SpaceType;
  name: string;
  description?: string;
  coordinates: { lat: number; lng: number };
  ownerId?: string;
  active: boolean;
  lastActivityAt: number;
  imageUrl?: string;
  tags?: string[];
}

export interface User {
  uid: string;
  type: UserType;
  nickname: string;
  email?: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface Content {
  id: string;
  spaceId: string;
  authorId: string;
  type: "record" | "photo" | "collection" | "plan";
  visibility: Visibility;
  text?: string;
  imageUrls?: string[];
  createdAt: number;
}

export interface GwandangRelation {
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted";
  connectedAt: number;
}
