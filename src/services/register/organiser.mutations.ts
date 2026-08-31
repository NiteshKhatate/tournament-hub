"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

interface RegisterOrganiserInput {
  name: string;
  username: string;
  password: string;
  email: string;
  contact: number;
}

export async function registerOrganiser(input: RegisterOrganiserInput) {
  const { name, username, password, email, contact } = input;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const { data: loginData, error: loginError } = await supabaseAdmin
    .from("login")
    .insert({
      username,
      password: hashedPassword,
      role: "organiser",
      status: "inactive",
    })
    .select()
    .single();

  if (loginError) {
    return { data: null, error: loginError.message };
  }

  const { data: organiserData, error: organiserError } = await supabaseAdmin
    .from("organisers")
    .insert({
      name,
      login_id: loginData.id,
      email,
      contact,
      status: "inactive",
    })
    .select()
    .single();

  if (organiserError) {
    await supabaseAdmin.from("login").delete().eq("id", loginData.id);
    return { data: null, error: organiserError.message };
  }

  return { data: organiserData, error: null };
}
