import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

const getAdminClient = () => {
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
};

export async function DELETE(request: Request) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authorization.split(' ')[1];
    const supabaseAdmin = getAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Clean up user-related data before deleting the auth user
    const cleanupPromises = [
      supabaseAdmin.from('user_profile').delete().eq('id', userId),
      supabaseAdmin.from('user_favourite').delete().eq('user_id', userId),
    ];

    await Promise.allSettled(cleanupPromises);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Failed to delete user from Supabase auth:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Unable to delete account right now' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error while deleting account' },
      { status: 500 },
    );
  }
}
