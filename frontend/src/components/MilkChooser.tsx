import { useEffect, useState } from "react"
import type { Milk } from '../types'

interface MilkChooserProps {
    milkInfo: Milk[]
    onChange: (milk: Milk) => void
}

export default function MilkChooser({ milkInfo, onChange } : MilkChooserProps) {
    const [selectedId, setSelectedId] = useState<number | null>(milkInfo.length > 0 ? milkInfo[0].id : null)

    useEffect(() => {
        setSelectedId(milkInfo.length > 0 ? milkInfo[0].id : null)
    }, [milkInfo])

    return (
        <>
            {milkInfo.map((m) => {
                const isSelected = m.id === selectedId
                return (
                    <div
                        key={m.id}
                        className={`flex flex-row gap-3 mb-3`}
                        onClick={() => { 
                            setSelectedId(m.id)
                            onChange(m)
                            }}>
                        <div className={`relative border-2 w-25 h-25 rounded-2xl
                            transition-all duration-150 active:scale-90
                            ${isSelected ? "border-[#343434] cursor-default" : "border-[#A2A2A2] cursor-pointer"}`}>
                            <div className="absolute bottom-[8px] ml-[27px] w-11 h-2 bg-black/50 rounded-full blur-[4px]" />
                            <img alt="Фото опции кастомизации" src={m.image_url}
                            className={`relative z-10`} />
                        </div>
                        <div className={`flex flex-col mt-5`}>
                            <p className={`text-[24px]`}>{m.name}</p>
                            <p className={`text-[16px] text-[#727171] -mt-1`}>{m.calories_delta} ккал • {m.price_delta}₽</p>
                        </div>
                    </div>
                )
                })}
        </>
    )
}