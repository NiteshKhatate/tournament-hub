import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const tournament_id = Number(body.tournament_id)
    const group_count = Number(body.group_count)

    if (!tournament_id || !group_count) {
      return Response.json(
        { error: 'Tournament ID and Group Count are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if groups already exist
    const { data: existingGroups, error: existingGroupsError } =
      await supabase
        .from('groups')
        .select('id')
        .eq('tournament_id', tournament_id)

    if (existingGroupsError) {
      return Response.json(
        { error: existingGroupsError.message },
        { status: 500 }
      )
    }

    if (existingGroups.length > 0) {
      return Response.json(
        {
          error:
            'Groups have already been generated for this tournament',
        },
        { status: 400 }
      )
    }

    // Fetch teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
      .eq('tournament_id', tournament_id)

    if (teamsError) {
      return Response.json(
        { error: teamsError.message },
        { status: 500 }
      )
    }

    if (!teams || teams.length === 0) {
      return Response.json(
        { error: 'No teams found for this tournament' },
        { status: 400 }
      )
    }

    const totalTeams = teams.length

    // Validate distribution
    if (totalTeams % group_count !== 0) {
      return Response.json(
        { error: 'Invalid group configuration' },
        { status: 400 }
      )
    }

    const teamsPerGroup = totalTeams / group_count

    if (teamsPerGroup < 3) {
      return Response.json(
        {
          error:
            'Each group must contain at least 3 teams',
        },
        { status: 400 }
      )
    }

    // Shuffle teams
    const shuffledTeams = [...teams].sort(
      () => Math.random() - 0.5
    )

    // Create groups
    const groupsToInsert = Array.from(
      { length: group_count },
      (_, index) => ({
        name: `Group ${index + 1}`,
        tournament_id,
      })
    )

    const {
      data: createdGroups,
      error: createGroupsError,
    } = await supabase
      .from('groups')
      .insert(groupsToInsert)
      .select()

    if (createGroupsError) {
      return Response.json(
        { error: createGroupsError.message },
        { status: 500 }
      )
    }

    if (!createdGroups || createdGroups.length === 0) {
      return Response.json(
        { error: 'Failed to create groups' },
        { status: 500 }
      )
    }

    // Create group-team mappings
    const groupTeamRows: {
      group_id: number
      team_id: number
    }[] = []

    for (let i = 0; i < createdGroups.length; i++) {
      const group = createdGroups[i]

      const groupTeams = shuffledTeams.slice(
        i * teamsPerGroup,
        (i + 1) * teamsPerGroup
      )

      for (const team of groupTeams) {
        groupTeamRows.push({
          group_id: group.id,
          team_id: team.id,
        })
      }
    }

    const { error: groupTeamsError } = await supabase
      .from('group_teams')
      .insert(groupTeamRows)

    if (groupTeamsError) {
      return Response.json(
        { error: groupTeamsError.message },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'Groups created successfully',
        groups_created: createdGroups.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Generate groups error:', error)

    return Response.json(
      {
        error: 'An error occurred while generating groups',
      },
      { status: 500 }
    )
  }
}