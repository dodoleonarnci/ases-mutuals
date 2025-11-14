export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type MatchStatus = "proposed" | "active" | "inactive";

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  grad_year: number | null;
  major: string | null;
  interests: string[] | null;
  created_at: string;
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  initiated_at: string;
  responded_at: string | null;
};

export type Match = {
  id: string;
  student_a_id: string;
  student_b_id: string;
  friendship_id: string | null;
  compatibility_score: number;
  status: MatchStatus;
  matched_at: string;
};

export type Signup = {
  id: string;
  email: string;
  created_at: string;
};



