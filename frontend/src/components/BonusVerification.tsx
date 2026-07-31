import { useEffect, useState } from 'react'
import Keypad from './Keypad'

interface BonusVerificationProps {
    isBonusVerificationOpen: boolean
    initialPhone: string
    onBonusVerificationClose: (code: string) => void
}

export default function BonusVerification({isBonusVerificationOpen, initialPhone, onBonusVerificationClose } : BonusVerificationProps) {
    const [digits, setDigits] = useState('')

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
        if (digits.length < 6) {
            setDigits(prev => prev + num)
        }
    }

    const handleDelete = () => {
        setDigits(prev => prev.slice(0, -1))
    }

    useEffect(() => {
        if (digits.length == 6) {
            onBonusVerificationClose(digits)
        }
    }, [digits])

    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center 
            bg-black/50 backdrop-blur-[4px] p-6
            transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isBonusVerificationOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >


            <button 
                onClick={() => { 
                    setDigits("")
                    onBonusVerificationClose(digits)
                 }}
                className={`mb-4 flex h-[87px] w-[87px] shrink-0 items-center justify-center rounded-full 
                bg-[#E4E2E2] shadow-md active:scale-90 transition-all duration-300 
                ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
                ${isBonusVerificationOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
                <img alt="Закрыть" src="/elements/close.png" className="w-8 h-8 object-contain"
                 />
            </button>


            <div 
                className={`relative w-[700px] h-[1000px] bg-[#E4E2E2] 
                rounded-[80px] overflow-hidden isolate
                transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isBonusVerificationOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
            >

                <div className="h-full px-10 pt-16 pb-4 flex flex-col justify-between items-center text-center">
                    
                    <div className="flex flex-col items-center w-full">
                        <div className="text-[43px] font-semibold text-center mb-6 leading-12">
                            Введите код подтверждения, который мы отправили на номер {formatPhone(initialPhone)}
                        </div>

                        <div className="flex justify-between gap-3 w-full mt-8">
                            {Array.from({ length: 6 }).map((_, index) => {
                                const char = digits[index] || ''
                                
                                return (
                                    <div
                                        key={index}
                                        className="flex-1 h-[130px] rounded-[24px] bg-[#cbcaca] 
                                                flex items-center justify-center 
                                                text-[48px] font-semibold text-black select-none
                                                transition-all duration-200"
                                    >
                                        {char}
                                    </div>
                                )
                            })}
                        </div>

                        <button 
                        onClick={()  {  }}
                        className="bg-[#CBCBCB] text-[#4E4E4E] cursor-pointer mt-5 active:scale-90 transition-all duration-200 text-2xl px-10 py-3 rounded-full font-medium">
                            Запросить новый код
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
