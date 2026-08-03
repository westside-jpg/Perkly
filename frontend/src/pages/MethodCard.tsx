interface MethodCardProps {
    onBack: () => void
    onApproved: () => void
    onDeclined: () => void
}

export default function MethodCard({ onBack, onApproved, onDeclined } : MethodCardProps) {
    return (
        <div className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide mt-6`}>

            {/* Кнопка назад */}
            <div 
                className={`flex flex-row gap-1 self-start w-full bg-black items-center px-8 py-[16px] rounded-full
                    cursor-pointer active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                onClick={() => { onBack() }}>
                    <img alt='Назад' src='elements/back.svg'
                    className={`h-5 w-5`} />
                    <p className={`text-white text-[22px] pl-2`}>Вернуться к способам оплаты</p>
            </div>
            
            <div className={`border-2 border-[#A2A2A2] rounded-[60px] justify-center mt-90
                px-10 py-3 text-3xl`}>
                Следуйте инструкциям на терминале
            </div>

            <div className={`fixed flex bottom-5 z-20 px-8`}>
                <div className={`flex flex-col gap-3`}>
                    <div className={`w-full bg-[#cc2a2a] text-white px-25 py-4 text-xl text-center rounded-full
                        transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}
                        onClick={() => { onDeclined() }}>
                            (ТЕСТ) Провести неудачную оплату
                    </div>
                    <div className={`w-full bg-[#37b041] text-white px-25 py-4 text-xl text-center rounded-full
                        transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}
                        onClick={() => { onApproved() }}>
                            (ТЕСТ) Провести успешную оплату
                    </div>
                </div>
            </div>
            
        </div>
    )
}