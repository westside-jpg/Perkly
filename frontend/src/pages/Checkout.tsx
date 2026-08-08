interface CheckoutProps {
    checkoutPrice: number
    onBack: () => void
    onNextMethodCard: () => void
    onNextMethodSBP: () => void
}

// Выбор способа оплаты перед мок-терминалом
export default function Checkout({ checkoutPrice, onBack, onNextMethodCard, onNextMethodSBP } : CheckoutProps) {
    return (
        <div className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide mt-6`}>

            {/* Кнопка назад */}
            <div 
                className={`flex flex-row gap-1 self-start w-full bg-black items-center px-8 py-[16px] rounded-full
                    cursor-pointer active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                onClick={() => { onBack() }}>
                    <img alt='Назад' src='elements/back.svg'
                    className={`h-5 w-5`} />
                    <p className={`text-white text-[22px] pl-2`}>Назад</p>
            </div>
            

            {/* Финальная цена */}
            <div className={`bg-black text-white text-[40px] font-semibold rounded-full px-20 py-2 mt-18`}>
                    {checkoutPrice}₽
            </div>

            <div className={`text-4xl border-2 border-[#A2A2A2] rounded-full px-16 py-4 mt-3`}>
                Выберите способ оплаты
            </div>

            {/* Карта/СБП */}
            <div className={`flex flex-row gap-4 mt-4`}>

                <div className={`flex flex-col gap-3`}>
                    <div className={`border-2 border-[#A2A2A2] rounded-[60px] w-[370px] h-[370px]
                        flex items-center justify-center cursor-pointer
                        transition-all duration-200 active:scale-90
                        ease-[cubic-bezier(0.16,1,0.3,1)]`}
                        onClick={() => { onNextMethodCard() }}>
                        <img alt="Способ оплаты: карта" src="elements/card.svg"
                        className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className={`border-2 border-[#A2A2A2] rounded-full text-center
                        py-2 text-2xl`}>Картой</p>
                </div>

                <div className={`flex flex-col gap-3`}>
                    <div className={`border-2 border-[#A2A2A2] rounded-[60px] w-[370px] h-[370px]
                        flex items-center justify-center cursor-pointer
                        transition-all duration-200 active:scale-90
                        ease-[cubic-bezier(0.16,1,0.3,1)]`}
                        onClick={() => { onNextMethodSBP() }}>
                        <img alt="Способ оплаты: карта" src="elements/sbp.svg" 
                        className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className={`border-2 border-[#A2A2A2] rounded-full text-center
                        py-2 text-2xl`}>СБП</p>
                </div>

            </div>

        </div>

    )

}