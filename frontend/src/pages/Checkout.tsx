interface CheckoutProps {
    checkoutPrice: number
    onBack: () => void
}

export default function Checkout({ checkoutPrice, onBack } : CheckoutProps) {
    <div className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide`}>

        {/* Кнопка назад */}
        <div 
            className={`flex flex-row gap-1 self-start w-full bg-black items-center px-8 py-[16px] rounded-full
                cursor-pointer active:scale-95 transition-all duration-200`}
            onClick={() => { onBack() }}>
                <img alt='Назад' src='elements/back.svg'
                className={`h-5 w-5`} />
                <p className={`text-white text-[22px] pl-2`}>Назад</p>
        </div>

        





    </div>
}