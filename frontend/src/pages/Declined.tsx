interface DeclinedProps {
    onBack: () => void
}

export default function Declined({ onBack }: DeclinedProps) {
    return (
        <div className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide mt-6`}>

            <div className={`flex flex-col items-center text-center mt-26`}>
                <div className={`bg-[#D82929] rounded-full
                    mb-4 px-10 py-10`}>
                    <img 
                        alt="Ошибка" 
                        src="/elements/close-white.svg" 
                        className={`w-10 h-10`} 
                    />
                </div>

                <div className={`text-3xl font-bold mb-4 tracking-tight
                    border-2 border-[#A2A2A2] px-5 py-3 rounded-full`}>
                    Ошибка оплаты
                </div>

                <p className={`text-2xl text-black leading-tight max-w-[450px]
                    border-2 border-[#A2A2A2] px-3 py-3 rounded-full`}>
                    Попробуйте снова или выберите другой способ оплаты
                </p>
            </div>

            <div className={`fixed bottom-5 z-20 w-full px-8 flex justify-center`}>
                <div 
                    className={`w-full bg-black rounded-full py-5 text-center
                        cursor-pointer active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                    onClick={() => { onBack() }}>
                        <p className={`text-white text-[24px]`}>
                            Вернуться к способам оплаты
                        </p>
                </div>
            </div>

        </div>
    )
}