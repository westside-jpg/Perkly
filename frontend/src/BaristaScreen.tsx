import KioskFrame from "./KioskFrame"
import { Toaster } from 'sonner'
import { toast } from 'sonner'

export default function BaristaScreen() {
    return (
        <KioskFrame>
            <Toaster
                position="top-center"
                style={{ fontFamily: "MyFont, sans-serif" }}
            />

            {/* Хэдер */}
            <div className="flex flex-col w-full">

                <div className="flex flex-row justify-between items-center">
                    <p className="font-extrabold text-[64px] leading-none">PERKLY</p>
                    <p className="font-extrabold text-[24px] px-6 py-1 border-3 border-[#A2A2A2] rounded-full text-[#3E3C3C]">
                        АКТИВНЫХ ЗАКАЗОВ: 3
                    </p>
                </div>


                <div className="flex flex-row justify-between items-center">
                    <p className="font-extrabold text-[32px] leading-none">ПАНЕЛЬ БАРИСТА</p>
                    <p className="font-extrabold text-[24px] px-6 py-[0.5px] border-3 border-[#A2A2A2] rounded-full text-[#3E3C3C]">
                        15:13
                    </p>
                </div>

            </div>

            {/* Контент */}
            <div className={`grid grid-cols-2 gap-4 mt-10`}>

                <div className={`bg-[#E4E2E2] rounded-3xl p-4`}>
                    {/* Номер заказа и время */}
                    <div className={`flex flex-row gap-2 border-b-2 pb-3 border-[#D1CDCD]`}>
                        <p className={`font-semibold text-[24px] bg-[#D1CDCD] rounded-full px-4 border-2 border-[#A2A2A2]`}>104</p>
                        <p className={`font-semibold text-[24px] bg-[#D1CDCD] rounded-full px-4 border-2 border-[#A2A2A2]`}>15:10</p>
                    </div>

                    {/* Список товаров */}
                    <div className={`flex flex-col gap-3 mt-3`}>
                        {/* Товар */}
                        <div className={`flex flex-col bg-[#CCCCCC] rounded-2xl p-2 items-center text-center`}>
                            {/* Название и объем */}
                            <p className={`font-extrabold text-[32px] text-[#3E3C3C]`}>Капучино</p>
                            <p className={`w-fit bg-[#A5A5A5] rounded-full font-extrabold text-[18px] px-4 py-0.5 mt-0.5 text-[#3E3C3C]`}>350 мл</p>
                            {/* Молоко */}
                            <div className={`flex flex-col w-full mt-3 bg-[#A5A5A5] p-2 rounded-2xl`}>
                                <p className={`font-extrabold text-[24px] text-[#3E3C3C]`}>Молоко</p>
                                <p className={`font-extrabold text-[18px] text-[#3E3C3C]`}>Обычное (3.2%)</p>
                            </div>
                            {/* Добавки */}
                            <div className={`flex flex-col w-full mt-2 bg-[#A5A5A5] p-2 rounded-2xl`}>
                                <p className={`font-extrabold text-[24px] text-[#3E3C3C]`}>Добавки</p>
                                <div className={`flex flex-col leading-6`}>
                                    <p className={`font-extrabold text-[18px] text-[#3E3C3C]`}>Карамельный сироп</p>
                                    <p className={`font-extrabold text-[18px] text-[#3E3C3C]`}>Карамельный сироп</p>
                                    <p className={`font-extrabold text-[18px] text-[#3E3C3C]`}>Лавандовый сироп</p>
                                </div>
                            </div>
                        </div>
                        <button className={`flex bg-black py-3 rounded-full items-center justify-center
                            transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                            active:scale-95 cursor-pointer`}>
                            <img alt="Готово" src="elements/apply.svg" className={`w-7 h-7`} />
                        </button>
                    </div>
                </div>



            </div>




        </KioskFrame>
    )
}