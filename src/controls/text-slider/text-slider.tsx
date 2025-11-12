import { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';

interface SliderPreset {
    title: string
    subtitle: string
}

function useLocalStorage() {
    const [presets, setPresets] = useState<SliderPreset[]>([]);

    useEffect(() => {
        const presetsJson = localStorage.getItem("slider-presets");
        const presetsParsed: SliderPreset[] = presetsJson ? JSON.parse(presetsJson) : [];
        if(presetsParsed.length > 0) { setPresets(presetsParsed); }
        else { setPresets(defaultSliderPresets()); }
    }, []);

    useEffect(() => {
        localStorage.setItem("slider-presets", JSON.stringify(presets));
    }, [presets])

    return {presets, setPresets};
}

function defaultSliderPresets(): SliderPreset[] {
    return [
        { title: 'COMMENTATORS', subtitle: 'ARI BLUESTEIN, PAM DURKIN, TESSA PELOSO' },
        { title: 'VENUE', subtitle: 'DASKALAKIS ATHLETIC CENTER, PHILADELPHIA, PA' },
        { title: 'OFFICIALS', subtitle: 'OFFICIAL ONE, OFFICIAL TWO, OFFICIAL THREE' },
    ];
}

function SliderPresetRow({ preset, selected, onClick, onSave }: { preset: SliderPreset, selected: boolean, onClick?: () => void, onSave: (preset: SliderPreset) => void }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(preset.title);
    const [subtitle, setSubtitle] = useState(preset.subtitle);

    function edit() {
        if (!selected) setEditing(true);
    }

    function save() {
        setEditing(false);
        onSave({ title: title, subtitle: subtitle });
    }

    if (editing) {
        return (
            <tr className='bg-white text-black'>
                <td>
                    <form onSubmit={save}>
                        <input value={title} onChange={e => setTitle(e.target.value)} />
                    </form>
                </td>
                <td>
                    <form onSubmit={save}>
                        <input className='w-full' value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                    </form>
                </td>
                <td className='text-center bg-blue-600 text-white cursor-pointer' onClick={save}>
                    SAVE
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className='cursor-pointer' onDoubleClick={edit}>{title}</td>
            <td className='cursor-pointer' onDoubleClick={edit}>{subtitle}</td>
            {selected ?
                <td className='text-center cursor-not-allowed bg-red-800'>ACTIVE</td> :
                <td onClick={onClick} className='cursor-pointer bg-green-950 text-center border-2 
                    border-gray-700 hover:bg-amber-600'>PUSH</td>
            }
        </tr>
    );
}

function Page() {
    const {presets, setPresets} = useLocalStorage();
    const [selectedIndex, setSelectedIndex] = useState(0);

    function addPreset() {
        setPresets([...presets, { title: "TITLE", subtitle: "SUBTITLE" }]);
    }

    function save(preset: SliderPreset, index: number) {
        const newList = presets.map((p, idx) => {
            if(idx == index) return preset;
            return p;
        });
        setPresets(newList);
    }

    async function push(preset: SliderPreset, index: number) {
        const result = await fetch("http://localhost:5000/api/state/game/setTextSlider", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preset)
        });
        const responseText = await result.text();
        console.log("PUSH RESULT:", responseText);
        if(responseText == "OK") { setSelectedIndex(index); }
    }

    return (
        <div className='p-10' style={{ color: '#009E67', fontFamily: 'Berkeley Mono' }}>
            <fieldset className='border p-5'>
                <legend className='px-3 font-bold text-3xl'>TEXT SLIDER CONTROL</legend>
                <table className='text-white text-left'>
                    <thead className='font-bold'>
                        <tr>
                            <th className='bg-gray-700 min-w-60' scope='col'>TITLE</th>
                            <th className='bg-gray-600 min-w-150' scope='col'>SUBTITLE</th>
                            <th className='bg-gray-500 min-w-30' scope='col'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {presets.map((x, idx) => (
                            <SliderPresetRow key={idx} preset={x}
                                selected={idx == selectedIndex} onClick={() => push(x, idx)}
                                onSave={p => save(p, idx)} />
                        ))}
                        <tr>
                            <td colSpan={3} className='text-center bg-gray-300 text-black cursor-pointer hover:bg-gray-400'
                                onClick={addPreset}>
                                ADD NEW PRESET
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fieldset>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Page />);