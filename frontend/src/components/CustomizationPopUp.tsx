import SyrupAndAddonChooser from './SyrupAndAddonChooser'
import MilkChooser from './MilkChooser'

interface CustomizationPopUpProps {
    isOpen: boolean
    onClose: () => void
}

export default function CustomizationPopUp({ isOpen, onClose }: CustomizationPopUpProps) {
    return (
        <div 
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center 
            bg-black/50 backdrop-blur-[4px] p-6 
            transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        >


            <button 
                onClick={onClose}
                className={`mb-4 flex h-[87px] w-[87px] shrink-0 items-center justify-center rounded-full 
                bg-[#E4E2E2] shadow-md active:scale-90 transition-all duration-300 
                ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer
                ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
            <img alt="Закрыть" src="/elements/close.png" className="w-8 h-8 object-contain" />
            </button>


            <div 
                className={`relative flex flex-col w-[700px] max-h-[950px] bg-[#E4E2E2] 
                rounded-[80px] overflow-y-auto scrollbar-hide px-10 pt-12 pb-32 
                transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
            >


                <div className="relative flex -mt-15 justify-center shrink-0">
                    <div className="absolute bottom-7 w-40 h-5 bg-black/35 rounded-full blur-md" />
                    <img src="/products/cappuchino.png" className="relative z-10 w-96" />
                </div>

                <p className="text-[64px] font-semibold text-center leading-15">Капучино</p>
                <p className="text-[24px] font-medium text-[#727171] text-center mt-3">350 мл • 180 ккал</p>

                <div className="w-64 h-[2px] bg-gray-500 mx-auto my-6 shrink-0" />

                <p className="text-[20px] font-medium max-w-[400px] mx-auto text-gray-500 text-center leading-6">
                    Баланс эспрессо, горячего молока и нежной молочной пены
                </p>

                <p className="text-3xl font-semibold mt-8">Размер</p>
                <div className={`flex flex-row gap-3 mt-4`}>
                    <p className={`flex-1 bg-[#CBCBCB] text-[#4E4E4E] font-middle text-[22px] py-4 text-center rounded-full`}>250 мл</p>
                    <p className={`flex-1 bg-black text-white text-[22px] font-middle py-4 text-center rounded-full`}>350 мл</p>
                    <p className={`flex-1 bg-[#CBCBCB] text-[#4E4E4E] font-middle text-[22px] py-4 text-center rounded-full`}>450 мл</p>
                </div>

                <p className="text-3xl font-semibold mt-8 mb-4">Тип молока</p>
                <MilkChooser />

                <p className="text-3xl font-semibold mt-8 mb-4">Сиропы</p>
                <SyrupAndAddonChooser />

                <p className="text-3xl font-semibold mt-8 mb-4">Добавки</p>
                <SyrupAndAddonChooser />

                <div className="sticky -bottom-20 flex flex-row gap-3 px-2 z-20">
                    <div className={`bg-[#CBCBCB] text-[#727171] rounded-full
                        flex items-center justify-center text-[22px] font-medium
                        px-8 py-4`}>
                        350 мл • 230 ккал • 356₽
                    </div>
                    <button className="flex-1 bg-black rounded-full flex items-center justify-center text-white text-4xl">
                        +
                    </button>
                </div>

            </div>
        </div>
    )
}