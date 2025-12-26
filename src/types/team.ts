export interface TeamInfo {
    team_id: number;
    abbreviation: string;
    display_name: string;
    short_name: string;
    mascot: string;
    nickname: string;
    team: string;
    color: string;
    alternate_color: string;
    group_id: number;
    conference_short_name: string;
    conference_name: string;
    conference_id: number;
    logo_name: string;
    website: string;
}

const IMAGES_BASE_URL = "https://images.dragonstv.io"

export const getTeamLogo = (team: TeamInfo) => new URL(`/logos/${team.logo_name}`, IMAGES_BASE_URL).toString();
export const getTeamKnockoutLogo = (team: TeamInfo) => new URL(`/logos-knockout/${team.logo_name}`, IMAGES_BASE_URL).toString();