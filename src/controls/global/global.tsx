import { GlobalSettingsProvider, useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import * as ReactDOM from 'react-dom/client';
import { PageProvider, usePageContext } from './context';
import { SportSettingsTab } from './tabs/sport';
import { TeamSettingsTab } from './tabs/team';
import { BasketballSettingsTab } from './tabs/basketball';
import { Sport } from '@/data/models';
import { WrestlingSettingsTab } from './tabs/wrestling';
import { ObjectStoreProvider } from '@/contexts/ObjectStoreContext';

const fontFamily = "Berkeley Mono, Berkeley Mono Variable";
const primaryColor = '#009E67';

const pageMapping = new Map([
    ['SPORT', SportSettingsTab],
    ['TEAM', TeamSettingsTab],
    ['BASKETBALL', BasketballSettingsTab],
    ['WRESTLING', WrestlingSettingsTab]
]);

function Page() {
    return (
        <GlobalSettingsProvider>
            <ObjectStoreProvider>
                <PageProvider>
                    <div className='px-10 py-5' style={{ color: primaryColor, fontFamily }}>
                        <Header />
                        <Body />
                    </div>
                </PageProvider>
            </ObjectStoreProvider>
        </GlobalSettingsProvider>
    );
}

function Body() {
    return (
        <div className='grid grid-cols-10'>
            <Sidebar />
            <MainContentContainer />
        </div>
    );
}

function MainContentContainer() {
    const context = usePageContext();

    if(!pageMapping.has(context.currentTab)) {
        return (
            <p>ERROR: COULD NOT FIND A TAB WITH THE NAME {context.currentTab}.</p>
        );
    }

    const PageComponent = pageMapping.get(context.currentTab)!;

    return (
        <fieldset className='col-span-8 border'>
            <PageComponent />
        </fieldset>
    );
}

function Sidebar() {
    const { settings } = useGlobalSettings();
    const basketballDisabled = settings.sport != Sport.MensBasketball && settings.sport != Sport.WomensBasketball;
    const wrestlingDisabled = settings.sport != Sport.Wrestling;

    return (
        <fieldset className='col-span-2 border flex flex-col min-h-[50vh]'>
            <SidebarTabButton name='SPORT' />
            <SidebarTabButton name='TEAM' />
            <SidebarTabButton disabled={basketballDisabled} name='BASKETBALL' />
            <SidebarTabButton disabled={wrestlingDisabled} name='WRESTLING' />
        </fieldset>
    );
}

function SidebarTabButton({name, disabled}: {name: string, disabled?: boolean}) {
    const context = usePageContext();
    const onClick = () => context.setCurrentTab(name);
    const selected = context.currentTab == name;

    if(disabled) {
        return (
            <p className='strikethrough text-gray-600 cursor-not-allowed'>{name}</p>
        )
    }

    if(selected) {
        return (
            <p style={{ backgroundColor: primaryColor }} className='text-white font-bold'>{name}</p>
        )
    }

    return (
        <p className='hover:underline cursor-pointer font-bold' onClick={onClick}>{name}</p>
    );
}

function Header() {
    return (
        <fieldset className='border p-2'>
            <p className='text-xl'>
                <span className='font-extrabold underline'>DRAGONSTV GRAPHICS</span>
                <span className='mx-2 font-light'>/</span>
                <span>GLOBAL SETTINGS</span>
            </p>
        </fieldset>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Page />);