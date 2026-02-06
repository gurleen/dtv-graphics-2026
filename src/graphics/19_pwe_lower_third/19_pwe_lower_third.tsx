import { Rect } from '@/components/rect';
import useAnimation from '@/util/use-animation';
import * as ReactDOM from 'react-dom/client';
// @ts-ignore
import PWELogo from './pwe.png'; 
import { US } from 'country-flag-icons/react/3x2'

function animation(timeline: gsap.core.Timeline) {
    timeline
        .from('.lower-third', { opacity: 0, x: -100, duration: 0.5, ease: 'power2.out' })
        .from('.sub-anim', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', stagger: 0.1 }, '-=0.25')
        .addPause()
        .to(".lower-third", { opacity: 0, x: 100, duration: 0.5, ease: 'power2.in' });
}


function PageRoot() {
    const container = useAnimation(animation);

    return (
        <div id="container" ref={container} style={{ fontFamily: 'Zuume' }}>
            <div className='m-5 lower-third flex justify-center'>
                <Rect width={1300} height={200} className='bg-gray-100 corner-bevel rounded-4xl flex border-t-2 border-b-2 border-r-2 drop-shadow-xl/30'>
                    <Rect width={400} height={200} className="bg-zinc-800 corner-bevel rounded-4xl flex items-center justify-center p-4 drop-shadow-xl/70">
                        <img src={PWELogo} className='drop-shadow-neutral-100 drop-shadow-xl/30' />
                    </Rect>
                    <div className='flex flex-col justify-center text-black mx-10 w-full h-full'>
                        <div className='flex justify-between'>
                            <div>
                                <p className='italic font-bold text-5xl sub-anim'>LILL TWINN X MIZZY COKE</p>
                                {/* <p className='italic font-bold text-5xl sub-anim'>& VINNY TALOTTA</p> */}
                                <p className='text-2xl sub-anim'>
                                    {/* <span>with </span>
                                    <span className='italic'>Buster</span>
                                    <span className='px-1'> • </span>  */}
                                    <span>Representing </span>
                                    <span className='italic'>The Infamous BTA</span>
                                </p>
                            </div>
                            <div className='flex items-center gap-2 text-3xl'>
                                <US className='h-5 sub-anim' />
                                <p className='sub-anim'>ATLANTIC CITY, NJ</p>
                                {/* <p className='sub-anim text-5xl font-bold'>POST GAME</p> */}
                            </div>
                        </div>
                        <Rect className='w-full my-4' height={1} color='#000000' />
                        <div className='flex justify-between'>
                            <p className='text-3xl sub-anim'>@lilltwinn, @mizzycokemusic</p>
                            <div className='flex gap-2 items-center'>
                                {/* <BioBadge name='AGE' value='26' />
                                <BioBadge name='TRAINED BY' value='CZW ACADEMY' /> */}
                                {/* <BioBadge name='' value='HARDCORE HALL OF FAME' /> */}
                                {/* <US className='h-5 sub-anim' />
                                <p className='sub-anim text-3xl'>COMING FROM THE PRE-GAME</p> */}
                            </div>
                        </div>
                    </div>
                </Rect>
            </div>
        </div>
    );
}

function BioBadge({ name, value }: { name: string; value: string }) {
    return (
        <div className='bg-black text-white text-2xl px-2 rounded-sm sub-anim'>
            <span>{name} </span> 
            <span className='font-bold'>{value}</span>
        </div>
    );
}


const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<PageRoot />);