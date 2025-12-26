import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { Sport } from "@/data/models";

export function SportSettingsTab() {
    const { settings } = useGlobalSettings();
    const selectedSportDisplay = sportDisplayValue(settings.sport);

    return (
        <div>
            <p className="inverted text-center">
                <span>SELECTED SPORT: </span>
                <span className="font-bold underline">{selectedSportDisplay}</span>
            </p>

            <div className="grid grid-cols-3 gap-5 p-5">
                <SportButton sport={Sport.MensBasketball} />
                <SportButton sport={Sport.WomensBasketball} />
                <SportButton sport={Sport.Wrestling} />
            </div>
        </div>
    );
}

function SportButton({sport} : {sport: Sport}) {
    const { settings, saveSettings } = useGlobalSettings();
    const sportLogo = new URL(sportLogoPath(sport), "https://gfx.dragonstv.io").toString();
    const sportDisplay = sportDisplayValue(sport);

    const onClick = () => saveSettings(draft => {
        draft.sport = sport;
    });

    if(settings.sport == sport) {
        return (
            <div className="flex flex-col gap-2 items-center justify-center border p-3 inverted">
                <img src={sportLogo} />
                <p>{sportDisplay}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2 items-center justify-center border p-3">
            <img className="cursor-pointer" onClick={onClick} src={sportLogo} />
            <p onClick={onClick} className="hover:underline cursor-pointer">{sportDisplay}</p>
        </div>
    );
}

function sportDisplayValue(sport: Sport) {
    switch (sport) {
        case Sport.MensBasketball:
            return "Men's Basketball";
        case Sport.WomensBasketball:
            return "Women's Basketball";
        case Sport.Wrestling:
            return "Wrestling";
        default:
            return "";
    }
}

function sportLogoPath(sport: Sport) {
    switch (sport) {
        case Sport.MensBasketball:
            return "/media/images/ncaa-logos/mens-basketball.png";
        case Sport.WomensBasketball:
            return "/media/images/ncaa-logos/womens-basketball.png";
        case Sport.Wrestling:
            return "/media/images/ncaa-logos/wrestling.png";
        default:
            return "";
    }
}