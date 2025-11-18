export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type MatchStatus = "proposed" | "active" | "inactive";

export type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  user_id: string | null;
  grad_year: number | null;
  major: string | null;
  interests: string[] | null;
  sex: "male" | "female" | "non-binary" | null;
  dorm: string | null;
  involvements: string | null;
  close_friends: string[] | null;
  uc_berkeley_choice: "no_friends" | "uc_berkeley" | null;
  survey_completed: boolean;
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
