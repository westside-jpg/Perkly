import { useState, useEffect } from 'react'

interface InactivityModalProps {
    isOpen: boolean
    onContinue: () => void
    onCancel: () => void
}

export default function InactivityModal({ isOpen, onContinue, onCancel }: InactivityModalProps) {
    const [timeLeft, setTimeLeft] = useState(15)

    // Запускаем отсчет 15 секунд каждый раз, когда модалка открывается
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(15)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onCancel()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, onCancel])

    // Форматирование секунд (0:15, 0:14 ...)
    const formattedTime = `0:${timeLeft < 10 ? '0' : ''}${timeLeft}`

    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center 
            bg-black/50 backdrop-blur-[4px] p-6
            transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >
            <div 
                className={`relative w-[700px] h-[750px] bg-[#E4E2E2] 
                rounded-[80px] overflow-hidden isolate p-12 flex flex-col justify-between items-center text-center
                transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
            >
                {/* Заголовок */}
                <div className="text-[42px] font-semibold tracking-tight text-black mt-6">
                    Вы желаете продолжить оформление заказа?
                </div>

                {/* Внутренний блок с таймером */}
                <div className="w-full bg-[#D8D6D6] rounded-[40px] p-8 flex flex-col items-center shadow-inner">
                    <p className="text-[22px] font-medium text-[#4E4E4E] mb-2">
                        Ваш заказ будет автоматически отменен через
                    </p>
                    <div className="text-[90px] font-bold tracking-tighter text-black mb-6">
                        {formattedTime}
                    </div>

                    {/* Полоса прогресса (плавное уменьшение за 15 секунд через CSS) */}
                    <div className="w-full h-4 bg-[#C2C0C0] rounded-full overflow-hidden p-0.5">
                        <div 
                            className="h-full bg-white rounded-full"
                            style={{ 
                                width: isOpen ? '0%' : '100%', 
                                transition: isOpen ? 'width 15s linear' : 'none' 
                            }}
                        />
                    </div>
                </div>

                {/* Кнопки Нет / Да */}
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-[#BCBCBC] text-black py-6 rounded-full text-[28px] font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                        Нет
                    </button>
                    <button
                        onClick={onContinue}
                        className="flex-1 bg-black text-white py-6 rounded-full text-[28px] font-semibold active:scale-95 transition-all cursor-pointer"
                    >
                        Да
                    </button>
                </div>
            </div>
        </div>
    )
}