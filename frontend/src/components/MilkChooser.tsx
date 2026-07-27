export default function MilkChooser() {
    return (
        <div className={`flex flex-row gap-3`}>
            <div className={`relative border-2 border-[#A2A2A2] w-25 h-25 rounded-2xl`}>
                <div className="absolute bottom-[8px] ml-[27px] w-11 h-2 bg-black/50 rounded-full blur-[4px]" />
                <img alt="Фото опции кастомизации" src="/options/milk/almond_milk.png"
                className={`relative z-10`} />
            </div>
            <div className={`flex flex-col mt-5`}>
                <p className={`text-[24px]`}>Миндальное</p>
                <p className={`text-[16px] text-[#727171] -mt-1`}>50 ккал • 60₽</p>
            </div>
        </div>
    )
}