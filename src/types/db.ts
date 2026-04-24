export type UserRole = "user" | "admin";
export type MembershipTier = "1" | "2" | "3";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  membership_tier: MembershipTier | null;
  created_at: string;
};

export type Program = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_path: string | null;
  price_label: string | null;
  sort_order: number;
  published: boolean;
  show_on_home: boolean;
};

export type ProgramContent = {
  program_id: string;
  body: string | null;
  video_path: string | null;
};

export type UserProgramAccess = {
  user_id: string;
  program_id: string;
  granted_at: string;
};
