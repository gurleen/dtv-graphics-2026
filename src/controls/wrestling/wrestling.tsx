import { act, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import * as ReactDOM from 'react-dom/client';
import type { Wrestler, WrestlerYear } from './types';
import { AwayRoster } from './awayRoster';
import { HomeRoster } from './homeRoster';
import { useTimer } from 'react-timer-hook';

function Page() {
    const [period, setPeriod] = useState(1);
    const [weight, setWeight] = useState(125);
    const [time, setTime] = useState(new Date());
    const {
        seconds,
        minutes,
        isRunning,
        start,
        pause,
        resume,
        restart
    } = useTimer({ expiryTimestamp: getInterval(3 * 60), autoStart: false });

    const clockStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
    }, [])

    return (
        <div className='p-10' style={{ color: '#009E67', fontFamily: 'Berkeley Mono' }}>
            <div className='grid grid-cols-5'>
                <div className='col-span-5 border-2 py-2 px-4'>
                    <div className='flex items-center justify-between'>
                        <p className='font-black text-2xl'>WRESTLING BUG CONTROLS</p>
                        <p className='font-bold'>DREXEL DRAGONSTV</p>
                    </div>
                </div>

                <div className='col-span-2 border-2 p-2'>
                    <TeamSide roster={AwayRoster} isHome={false} />
                </div>
                <div className='col-span-1 border-2 flex flex-col items-center'>
                    <div className='border-2 w-full py-3 center-x-y'>
                        <p className='font-black tabular-nums text-3xl'>{time.toLocaleTimeString()}</p>
                    </div>

                    <div className='border-2 w-full py-2 center-x-y'>
                        {/* <p contentEditable className='text-4xl font-bold tabular-nums' style={{ fontFamily: 'DSEG7 Classic' }}>{clockStr}</p> */}
                        <EditableClock minutes={minutes} seconds={seconds} isRunning={isRunning} onTimeChange={x => restart(getInterval(x), false)} />
                    </div>
                    
                    <ClockButton isPlaying={isRunning} resume={resume} pause={pause} />

                    <button onClick={() => restart(getInterval(3 * 60), false)} 
                    className='w-full bg-blue-900 text-white py-3 cursor-pointer hover:bg-blue-950'>
                        RESET
                    </button>

                    <div className='border-2 w-full grid grid-cols-4 font-bold text-3xl'>
                        <PeriodButton period={1} label='1st' setPeriod={setPeriod} current={period} />
                        <PeriodButton period={2} label='2nd' setPeriod={setPeriod} current={period} />
                        <PeriodButton period={3} label='3rd' setPeriod={setPeriod} current={period} />
                        <PeriodButton period={4} label='OT'  setPeriod={setPeriod} current={period} />
                    </div>

                    <div className='border-2 w-full'>
                        <select value={weight} onChange={e => setWeight(parseInt(e.target.value))} className='w-full text-2xl text-center py-2'>
                            <option value={125}>125lbs</option>
                            <option value={133}>133lbs</option>
                            <option value={141}>141lbs</option>
                            <option value={149}>149lbs</option>
                            <option value={157}>157lbs</option>
                            <option value={165}>165lbs</option>
                            <option value={174}>174lbs</option>
                            <option value={184}>184lbs</option>
                            <option value={197}>197lbs</option>
                            <option value={285}>285lbs</option>
                        </select>
                    </div>
                </div>
                <div className='col-span-2 border-2 p-2'>
                    <TeamSide roster={HomeRoster} isHome={true} />
                </div>
            </div>
        </div>
    );
}

function PeriodButton({period, label, setPeriod, current}: {period: number, label: string, setPeriod: Dispatch<SetStateAction<number>>, current: number}) {
    if(period == current) {
        return (
            <div className='border-2 py-3 center-x-y bg-green-900 text-white cursor-not-allowed'>{label}</div>
        );
    }
    return (
        <div onClick={() => setPeriod(period)} className='border-2 py-3 center-x-y cursor-pointer'>{label}</div>
    );
}

function ClockButton({isPlaying, resume, pause}: { isPlaying: boolean, resume: () => void, pause: () => void }) {
    if(isPlaying) {
        return (
            <button onClick={pause} className='w-full bg-red-700 text-white py-3 cursor-pointer hover:bg-red-900'>STOP</button>
        );
    }

    return (
        <button onClick={resume} className='w-full bg-green-700 text-white py-3 cursor-pointer hover:bg-green-900'>START</button>
    );
}

const getInterval = (seconds: number) => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + seconds);
    return time;
}

function yearToString(year: WrestlerYear): string {
    switch(year) {
        case 1:
            return 'FRESHMAN';
        case 2:
            return 'SOPHOMORE';
        case 3:
            return 'JUNIOR';
        case 4:
            return 'SENIOR';
        case 5:
            return 'GRADUATE';
    }
}

function TeamSide({roster, isHome}: {roster: Wrestler[], isHome: boolean}) {
    const [activeIdx, setActiveIdx] = useState<number>(0);
    const active = roster[activeIdx]!;
    const [score, setScore] = useState<number>(0);
    const [isRanked, setIsRanked] = useState<boolean>(false);
    const [rank, setRank] = useState<number>(1);

    const updateScore = (delta: number) => setScore(Math.max(score + delta, 0));
    const titleText = isHome ? "HOME CONTROLS" : "AWAY CONTROLS";
    const rowDir = isHome ? '*:flex-row-reverse' : '';
    const secondaryWeight = active.secondaryWeightClass?.toString() ?? "NO";

    return (
        <div className={`flex flex-col gap-5 ${rowDir}`}>
            <p className='text-center font-black text-2xl'>{titleText}</p>

            <select value={activeIdx} onChange={e => setActiveIdx(parseInt(e.target.value))}
             className='py-2 px-4 border border-gray-300 focus:outline-none focus:ring-2 
                font-black text-xl
                focus:ring-blue-500 focus:border-transparent'>
                {roster.map((w, i) => <option value={i} key={i}>{w.firstName} {w.lastName}</option>)}
            </select>

            <div className='grid grid-cols-6'>
                <p className='col-span-2 border-2 py-2 text-center font-bold'>{active.primaryWeightClass} lbs PRIMARY</p>
                <p className='col-span-2 border-2 py-2 text-center font-bold'>{secondaryWeight} SECONDARY</p>
                <p className='col-span-2 border-2 py-2 text-center font-bold'>
                    {active.isRedshirt && <span className='text-red-600'>REDSHIRT </span>}
                    <span>{yearToString(active.year)}</span>
                </p>
                <RankedButton isRanked={isRanked} setIsRanked={setIsRanked} />
                <div className='col-span-3 border-2 flex'>
                    <input value={rank} onChange={e => setRank(e.target.valueAsNumber)} min={0} max={25} disabled={!isRanked}
                    type='number' className={`border-2 w-full text-center font-bold text-2xl ${isRanked ? '' : 'opacity-50'}`} />
                </div>
            </div>

            <div className='flex gap-2 text-2xl'>
                <button onClick={() => updateScore(-1)}
                    className='bg-red-800 border border-grey-300 hover:bg-red-900 focus:border-white cursor-pointer text-white px-3'> -1</button>
                <div className='bg-white px-4 min-w-12 py-1 text-black'>
                    <p className='font-black text-5xl tabular-nums'>{score}</p>
                </div>
                <button onClick={() => updateScore(1)}
                    className='bg-green-800 border border-grey-300 hover:bg-green-900 focus:border-white cursor-pointer text-white px-3'> +1</button>
                <button onClick={() => updateScore(2)} 
                    className='bg-green-800 border border-grey-300 hover:bg-green-900 focus:border-white cursor-pointer text-white px-3'> +2</button>
                <button onClick={() => updateScore(3)} 
                    className='bg-green-800 border border-grey-300 hover:bg-green-900 focus:border-white cursor-pointer text-white px-3'> +3</button>
            </div>
        </div>
    );
}

function RankedButton({isRanked, setIsRanked}: {isRanked: boolean, setIsRanked: Dispatch<SetStateAction<boolean>>}) {
    if(isRanked) {
        return (
            <div onClick={() => setIsRanked(!isRanked)} className='col-span-3 border-2 center-x-y p-2 bg-green-800'>
                <span className='text-white'>RANKED</span>
            </div>
        );
    }
    else {
        return (
            <div onClick={() => setIsRanked(!isRanked)} className='col-span-3 border-2 center-x-y p-2 bg-red-800 hover:bg-red-900 cursor-pointer select-none'>
                <span className='text-white'>UNRANKED</span>
            </div>
        );
    }
}

interface EditableClockProps {
  minutes: number;
  seconds: number;
  onTimeChange: (totalSeconds: number) => void;
  isRunning: boolean;
}

function EditableClock({ minutes, seconds, onTimeChange, isRunning }: EditableClockProps) {
  const pRef = useRef<HTMLParagraphElement>(null);

  const formatTime = (m: number, s: number): string => {
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleBlur = () => {
    if (!pRef.current) return;
    
    const text = pRef.current.textContent;
    if (!text) return;
    
    // Validate and parse the input
    const match = text.match(/^(\d{1,2}):(\d{2})$/);
    
    if (match) {
      const newMinutes = parseInt(match[1]!, 10);
      const newSeconds = parseInt(match[2]!, 10);
      
      // Validate seconds are 0-59
      if (newSeconds >= 0 && newSeconds < 60) {
        const totalSeconds = newMinutes * 60 + newSeconds;
        onTimeChange(totalSeconds);
      } else {
        // Reset to current value if invalid
        pRef.current.textContent = formatTime(minutes, seconds);
      }
    } else {
      // Reset to current value if invalid format
      pRef.current.textContent = formatTime(minutes, seconds);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      pRef.current?.blur();
    }
  };

  return (
    <p
      className='text-4xl font-bold tabular-nums'
      ref={pRef}
      contentEditable={!isRunning}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        cursor: isRunning ? 'default' : 'text',
        userSelect: isRunning ? 'none' : 'text',
        fontFamily: 'DSEG7 Classic'
      }}
    >
      {formatTime(minutes, seconds)}
    </p>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Page />);