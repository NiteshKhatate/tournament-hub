import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('group_teams')
      .select(`
        id,
        teams (
          id,
          name
        )
      `)
      .eq('group_id', id)

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return Response.json(
      {
        teams: data.map((item) => item.teams),
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      { error: 'Failed to load teams' },
      { status: 500 }
    )
  }
}