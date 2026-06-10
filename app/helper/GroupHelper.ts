export function getGroupOptions(teamCount: number) {
    const options = []

    for (let groups = 1; groups <= teamCount / 3; groups++) {
        if (teamCount % groups === 0) {
            const teamsPerGroup = teamCount / groups

            if (teamsPerGroup >= 3) {
                options.push({
                groups,
                teamsPerGroup,
                })
            }
        }
    }
    return options
}