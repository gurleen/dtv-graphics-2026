import { Button } from "@/components/Button";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import type { TeamSide } from "@/data/models";
import { getTeamKnockoutLogo, getTeamLogo, type TeamInfo } from "@/types/team";
import { Color } from "color-core";
import { useState, type Dispatch, type SetStateAction } from "react";
import Select from 'react-select'

type TeamOption = { value: number; label: string };

export function TeamSettingsTab() {
    const [currentTab, setCurrentTab] = useState<TeamSide>("Home");

    return (
        <div>
            <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <TeamSelect side={currentTab} />
        </div>
    );
}

function TeamSelect({side}: {side: TeamSide}) {
    const { homeTeam, awayTeam, teamSearch, saveSettings } = useGlobalSettings();
    const team = side == "Home" ? homeTeam : awayTeam;
    const [searchedTeamId, setSearchedTeamId] = useState<number>(team.team_id);
    const defaultSearchValue = teamSearch.find(t => t.value === team.team_id);
    const setTeamButtonDisabled = searchedTeamId == team.team_id

    const onSetTeam = () => {
        saveSettings(draft => {
            if(side == "Home") { draft.homeTeamId = searchedTeamId; }
            else { draft.awayTeamId = searchedTeamId; }
        });
    }

    return (
        <div>
            <div className="grid grid-cols-6">
                <TeamLogo team={team} />
                <TeamInfoContainer team={team} />
            </div>
            
            <div className="flex gap-2 p-3">
                <Select<TeamOption> 
                    className="w-[50%]" 
                    options={teamSearch} 
                    onChange={v => v && setSearchedTeamId(v.value)}
                    defaultValue={defaultSearchValue} />
                <Button onClick={onSetTeam} disabled={setTeamButtonDisabled}>SET TEAM</Button>
            </div>
        </div>
    );
}

function TeamLogo({team}: {team: TeamInfo}) {
    const [usingColorLogo, setUsingColorLogo] = useState(true);
    const logo = getTeamLogo(team);
    const knockoutLogo = getTeamKnockoutLogo(team);

    const logoInUse = usingColorLogo ? logo : knockoutLogo;
    const onClick = () => setUsingColorLogo(!usingColorLogo);

    return (
        <div className="col-span-2 border">
            <img onClick={onClick} className="cursor-pointer" src={logoInUse} />
        </div>
    );
}

function TeamInfoContainer({team}: {team: TeamInfo}) {
    const fullWebsite = "https://" + team.website

    return (
        <div className="col-span-4 border">
            <p className="inverted text-center text-2xl py-2">
                <span>{team.team}</span>
                <span className="ms-2 font-bold">{team.mascot}</span>
            </p>

            <div className="grid grid-cols-2">
                <ColorDisplayBox color={team.color} />
                <ColorDisplayBox color={team.alternate_color} />
            </div>

            <div className="border text-center py-2">
                <a target="_blank" className="hover:underline cursor-pointer" href={fullWebsite}>{team.website}</a>
            </div>
        </div>
    );
}

function getContrastColor(color: Color): string {
    const rgb = color.toRgb();

    // Calculate relative luminance using WCAG formula
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function ColorDisplayBox({color}: {color: string}) {
    const [copied, setCopied] = useState(false);
    const colorObj = new Color(color);
    const textColor = getContrastColor(colorObj);

    const onClick = () => {
        navigator.clipboard.writeText(colorObj.toHex());
        setCopied(true);
        setTimeout(() => setCopied(false), 500);
    };

    return (
        <div onClick={onClick}
            className="text-center py-2 hover:underline cursor-pointer"
            style={{ backgroundColor: colorObj.toHex(), color: textColor }}>
            {copied ? 'COPIED!' : colorObj.toHex()}
        </div>
    );
}

type TabBarProps = {tab?: TeamSide, currentTab: TeamSide, setCurrentTab: Dispatch<SetStateAction<TeamSide>>}

function TabBar({currentTab, setCurrentTab}: TabBarProps) {
    return (
        <div className="grid grid-cols-2">
            <TabBarItem tab="Home" currentTab={currentTab} setCurrentTab={setCurrentTab} />
            <TabBarItem tab="Away" currentTab={currentTab} setCurrentTab={setCurrentTab} />
        </div>
    );
}

function TabBarItem({tab, currentTab, setCurrentTab}: TabBarProps) {
    const onClick = () => tab && setCurrentTab(tab);

    if(currentTab == tab) {
        return (
            <div className="border text-center font-bold inverted">
                {tab}
            </div>
        )
    }

    return (
        <div onClick={onClick} className="border text-center font-bold cursor-pointer hover:underline">
            {tab}
        </div>
    );
}