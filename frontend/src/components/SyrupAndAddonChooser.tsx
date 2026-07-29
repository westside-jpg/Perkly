type SyrupsAndAddons = {
    id:             number
    name:           string
    volume:         number
    unit:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

interface SyrupAndAddonChooserProps {
    syrupsAndAddons: SyrupsAndAddons[]
}

export default function SyrupAndAddonChooser({ syrupsAndAddons }: SyrupAndAddonChooserProps) {
    return (
        <>
            {syrupsAndAddons.map((p) => {
                return (
                    <div className={`flex flex-row gap-3`}
                     key={p.id}>
                    <div className={`relative border-2 border-[#A2A2A2] w-25 h-25 rounded-2xl`}>
                        <div className="absolute bottom-[6px] ml-[20px] w-15 h-2 bg-black/50 rounded-full blur-[4px]" />
                        <img alt="Фото опции кастомизации" src={p.image_url}
                        className={`relative z-10`} />
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[24px]`}>{p.name}</p>
                        <p className={`text-[16px] text-[#727171] -mt-1`}>{p.volume} {p.unit} • {p.calories_delta} ккал • {p.price_delta}₽</p>
                        <div className={`flex flex-row gap-3 mt-[6px]`}>
                            <button className={`flex justify-center text-[20px] w-8 h-8 rounded-full bg-black text-white`}>-</button>
                            <p className={`justify-center text-[20px] pt-px pl-[2px] min-w-4`}>0</p>
                            <button className={`flex justify-center pt-px text-[20px] w-8 h-8 rounded-full bg-black text-white`}>+</button>
                        </div>
                    </div>
                </div>
                )
            })}
        </>
    )
}