"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

interface RegisterPlayerInput {
  name: string;
  email: string;
  contact: number;
  sport_id: number;
  id_type: "aadhar" | "pan" | "school_id" | "college_id";
  id_proof: string;
  birthdate: string;
  height?: number;
  weight?: number;
}

export async function registerPlayer(input: RegisterPlayerInput) {
  const { data, error } = await supabaseAdmin
    .from("players")
    .insert({ ...input, status: "inactive" })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
