'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateOrganiserInput {
  name: string;
  email?: string;
  contact?: string;
  username: string;
  password: string;
}

export async function createOrganiser(input: CreateOrganiserInput) {
  const { name, email, contact, username, password } = input;

  // check username isn't already taken
  const { data: existingLogin } = await supabaseAdmin
    .from('login')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingLogin) {
    return { data: null, error: 'Username already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: login, error: loginError } = await supabaseAdmin
    .from('login')
    .insert({
      username,
      password: hashedPassword,
      role: 'organiser',
      status: 'active',
    })
    .select()
    .single();

  if (loginError) {
    return { data: null, error: loginError.message };
  }

  const { data: organiser, error: organiserError } = await supabaseAdmin
    .from('organisers')
    .insert({
      name,
      email,
      contact,
      login_id: login.id,
    })
    .select()
    .single();

  if (organiserError) {
    // roll back the login row since the organiser insert failed
    await supabaseAdmin.from('login').delete().eq('id', login.id);
    return { data: null, error: organiserError.message };
  }

  revalidatePath('/organisers');
  return { data: organiser, error: null };
}

interface UpdateOrganiserInput {
  id: number;
  name: string;
  email?: string;
  contact?: string;
  status: 'active' | 'inactive';
}

export async function updateOrganiser(input: UpdateOrganiserInput) {
  const { id, name, email, contact, status } = input;

  const { data, error } = await supabaseAdmin
    .from('organisers')
    .update({ name, email, contact, status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/organisers');
  return { data, error: null };
}

export async function deleteOrganiser(id: number) {
  // fetch the linked login_id first so we can clean it up too
  const { data: organiser, error: fetchError } = await supabaseAdmin
    .from('organisers')
    .select('login_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const { error: deleteOrganiserError } = await supabaseAdmin
    .from('organisers')
    .delete()
    .eq('id', id);

  if (deleteOrganiserError) {
    return { error: deleteOrganiserError.message };
  }

  // clean up the associated login record too, since it's meaningless without the organiser
  if (organiser?.login_id) {
    await supabaseAdmin.from('login').delete().eq('id', organiser.login_id);
  }

  revalidatePath('/organisers');
  return { error: null };
}