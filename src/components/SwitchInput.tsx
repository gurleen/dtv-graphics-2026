interface SwitchInputProps {
    value: boolean;
    onChange: (newValue: boolean) => void;
}

export function SwitchInput({ value, onChange }: SwitchInputProps) {
    const onClick = () => {
        onChange(!value);
    }

    if(value) {
        return (
            <div className="flex cursor-pointer select-none" onClick={onClick}>
                <p className="bg-green-800 text-white w-10 ps-2">ON</p>
                <div className="bg-gray-500 w-4"></div>
            </div>
        );
    }

    return (
        <div className="flex cursor-pointer select-none" onClick={onClick}>
            <div className="bg-gray-500 w-4"></div>
            <p className="bg-red-800 text-white w-10 text-right pe-2">OFF</p>
        </div>
    );
}
