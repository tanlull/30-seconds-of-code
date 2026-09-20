export type ClientComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ClientPost = {
  id: string;
  sectionId: string | null;
  authorName: string;
  subject: string;
  body: string;
  color: string;
  imageUrl: string | null;
  linkUrl: string | null;
  x: number;
  y: number;
  lat: number | null;
  lng: number | null;
  position: number;
  dateField: string | null;
  createdAt: string;
  reactionCount: number;
  reacted: boolean;
  comments: ClientComment[];
};

export type ClientSection = { id: string; title: string; position: number };

export type ClientBoard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  format: string;
  wallpaper: string;
  visibility: string;
  postColor: string;
  allowComments: boolean;
  allowReactions: boolean;
  reactionType: string;
  owner: { id: string; name: string; color: string };
  updatedAt: string;
  sections: ClientSection[];
  posts: ClientPost[];
};

export type SessionUserLite = { id: string; name: string; color: string } | null;
