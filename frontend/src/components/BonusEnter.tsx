import { useEffect, useState } from 'react'
import Keypad from './Keypad'

interface BonusEnterProps {
    isBonusEnterOpen: boolean
    initialPhone: string
    bonusProgramState: string
    onBasicClose: () => void
    onBonusEnterClose: (p: string) => void
    onSwitchToRegistration: () => void
}

// Ввод номера для входа в бонусную программу
export default function BonusEnter({ isBonusEnterOpen, initialPhone, bonusProgramState, onBasicClose, onBonusEnterClose, onSwitchToRegistration } : BonusEnterProps) {
    const [digits, setDigits] = useState('')

    useEffect(() => {
        if (isBonusEnterOpen) {
            setDigits(initialPhone)
        }
    }, [isBonusEnterOpen, initialPhone])

    const formatPhone = (val: string) => {
        const mask = '+7 (___) ___-__-__'
        let digitIndex = 0

        return mask.replace(/_/g, () => {
            if (digitIndex < val.length) {
                return val[digitIndex++]
            }
            return '_'
        })
    }

    const handleNumberClick = (num: string) => {
        if (digits.length < 10) {
            setDigits(prev => prev + num)
        }
    }

    const handleDelete = () => {
        setDigits(prev => prev.slice(0, -1))
    }

    useEffect(() => {
        if (digits.length == 10) {
            onBonusEnterClose(digits)
        }
    }, [digits])

    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center 
            bg-black/50 backdrop-blur-[4px] p-6
            transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isBonusEnterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >


            <button 
                onClick={() => { 
                    onBasicClose()
                }}
                className={`mb-4 flex h-[87px] w-[87px] shrink-0 items-center justify-center rounded-full 
                bg-[#E4E2E2] shadow-md active:scale-90 transition-all duration-300 
                ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
                ${isBonusEnterOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
                <img alt="Закрыть" src="/elements/close.png" className="w-8 h-8 object-contain" />
            </button>


            <div 
                className={`relative w-[700px] h-[1000px] bg-[#E4E2E2] 
                rounded-[80px] overflow-hidden isolate
                transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isBonusEnterOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
            >

                <div className="h-full px-10 pt-24 pb-4 flex flex-col justify-between items-center text-center">
                    
                    <div className="flex flex-col items-center w-full">
                        <div className="text-[45px] font-semibold text-center mb-4">
                            Введите номер телефона
                        </div>

                        <div className="bg-black text-white w-full
                            rounded-full px-8 py-4 text-5xl 
                            font-semibold tracking-wider 
                            mb-4 text-center select-none">
                            {formatPhone(digits)}
                        </div>

                        <button 
                        onClick={() => { onSwitchToRegistration() }}
                        className={`bg-[#CBCBCB] text-[#4E4E4E] cursor-pointer active:scale-90
                        transition-all duration-200 text-2xl px-10 py-3 rounded-full font-medium self-start
                        ${bonusProgramState != 'noNumber' ? "cursor-default pointer-events-none max-h-0 !m-0 !p-0 opacity-0" : ""}`}>
                            У меня нет аккаунта
                        </button>
                    </div>

                    <div className="w-full">
                        <Keypad onNumberClick={handleNumberClick} onDelete={handleDelete} />
                    </div>

                </div>
                
            </div>
        </div>
    )
}
