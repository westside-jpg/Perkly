import React from 'react'

interface KeypadProps {
    onNumberClick: (num: string) => void
    onDelete: () => void
}

export default function Keypad({ onNumberClick, onDelete }: KeypadProps) {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

    return (
        <div className="grid grid-cols-3 gap-4 w-full mx-auto select-none my-6">
            {/* Кнопки 1 - 9 */}
            {numbers.map((num) => (
                <button
                    key={num}
                    type="button"
                    onClick={() => onNumberClick(num)}
                    className="h-24 bg-[#D3D1D1] hover:bg-[#C5C3C3] active:scale-95 
                               text-5xl font-medium rounded-full flex items-center 
                               justify-center transition-all duration-150 cursor-pointer"
                >
                    {num}
                </button>
            ))}

            {/* Пустое место слева от нуля для центрирования */}
            <div />

            {/* Кнопка 0 */}
            <button
                type="button"
                onClick={() => onNumberClick('0')}
                className="h-24 bg-[#D3D1D1] hover:bg-[#C5C3C3] active:scale-95 
                           text-5xl font-medium rounded-full flex items-center 
                           justify-center transition-all duration-150 cursor-pointer"
            >
                0
            </button>

            {/* Кнопка удаления */}
            <button
                type="button"
                onClick={onDelete}
                className="h-24 bg-[#D3D1D1] hover:bg-[#C5C3C3] active:scale-95 
                           rounded-full flex items-center justify-center 
                           transition-all duration-150 cursor-pointer"
                aria-label="Удалить символ"
            >
                <img 
                    src="/elements/delete.svg" 
                    alt="Удалить" 
                    className="w-14 h-14 object-contain opacity-70"
                />
            </button>
        </div>
    )
}
