"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

interface RegisterTeamInput {
  name: string;
  sport_id: number;
  username: string;
  password: string;
  email: string;
  contact: number;
}

export async function registerTeam(input: RegisterTeamInput) {
  const { name, sport_id, username, password, email, contact } = input;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const { data: loginData, error: loginError } = await supabaseAdmin
    .from("login")
    .insert({
      username,
      password: hashedPassword,
      role: "team_manager",
      status: "inactive",
    })
    .select()
    .single();

  if (loginError) {
    return { data: null, error: loginError.message };
  }

  const { data: teamData, error: teamError } = await supabaseAdmin
    .from("teams")
    .insert({
      name,
      sport_id,
      login_id: loginData.id,
      email,
      contact,
      status: "inactive",
    })
    .select()
    .single();

  if (teamError) {
    await supabaseAdmin.from("login").delete().eq("id", loginData.id);
    return { data: null, error: teamError.message };
  }

  return { data: teamData, error: null };
}
