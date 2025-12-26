interface NumberInputProps {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    max?: number;
}

export function NumberInput({ value, onChange, min, max }: NumberInputProps) {
    const handleIncrement = () => {
        const newValue = value + 1;
        if (max === undefined || newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - 1;
        if (min === undefined || newValue >= min) {
            onChange(newValue);
        }
    };

    const canIncrement = max === undefined || value < max;
    const canDecrement = min === undefined || value > min;

    return (
        <div className="flex gap-3">
            <p
                className={`bg-red-800 text-white px-3 select-none ${canDecrement ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={handleDecrement}
            >
                −
            </p>
            <input
                className="bg-gray-800 outline-1 outline-gray-600 text-white w-15 text-center"
                value={value}
                readOnly
            />
            <p
                className={`bg-green-800 text-white px-3 select-none ${canIncrement ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={handleIncrement}
            >
                +
            </p>
        </div>
    );
}
