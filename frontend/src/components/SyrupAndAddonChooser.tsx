import { useState, useEffect } from "react"

import type { PopUpOption } from '../types'

interface SyrupAndAddonChooserProps {
    syrupsAndAddons: PopUpOption[]
    totalCount: number
    onTotalCountChange: (newTotal: number) => void
    onChange: (option: PopUpOption, action: 'add' | 'remove') => void
}

export default function SyrupAndAddonChooser({ syrupsAndAddons, totalCount, onTotalCountChange, onChange }: SyrupAndAddonChooserProps) {
    const [counts, setCounts] = useState<Record<number, number>>({})

    const handleIncrement = (item: PopUpOption) => {
        // Не больше трёх сиропов и добавок суммарно на один напиток
        if (totalCount >= 3) return

        setCounts(prev => ({
            ...prev,
            [item.id]: (prev[item.id] || 0) + 1
        }))
        onTotalCountChange(totalCount + 1)
        
        onChange(item, 'add')
    }

    const handleDecrement = (item: PopUpOption) => {
        const currentItemCount = counts[item.id] || 0
        if (currentItemCount <= 0) return

        setCounts(prev => ({
            ...prev,
            [item.id]: currentItemCount - 1
        }))
        onTotalCountChange(totalCount - 1)

        onChange(item, 'remove')
    }

    useEffect(() => {
        setCounts({})
    }, [syrupsAndAddons])

    return (
        <>
            {syrupsAndAddons.map((p) => {
                const itemNum = counts[p.id] || 0

                return (
                    <div className={`flex flex-row gap-3`}
                     key={p.id}>
                    <div className={`relative border-2 w-25 h-25 rounded-2xl
                        transition-all duration-300
                        ${itemNum > 0 ? "border-[#343434]" : "border-[#A2A2A2]"}`}>
                        <div className="absolute bottom-[6px] ml-[20px] w-15 h-2 bg-black/50 rounded-full blur-[4px]" />
                        <img alt="Фото опции кастомизации" src={p.image_url}
                        className={`relative z-10`} />
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[24px]`}>{p.name}</p>
                        <p className={`text-[16px] text-[#727171] -mt-1`}>{p.volume} {p.unit} • {p.calories_delta} ккал • {p.price_delta}₽</p>
                        <div className={`flex flex-row gap-3 mt-[6px]`}>
                            <button className={`flex justify-center text-[20px] w-8 h-8 rounded-full
                                transition-all duration-200
                                ${itemNum == 0 ? "bg-[#A2A2A2] text-[#E4E2E2] pointer-events-none" : "bg-black text-white cursor-pointer"}`}
                                onClick={() => handleDecrement(p)}
                                >-</button>
                            <p className={`justify-center text-[20px] pt-px pl-[2px] min-w-4`}>{itemNum}</p>
                            <button className={`flex justify-center pt-px text-[20px] w-8 h-8 rounded-full
                                transition-all duration-200
                                ${totalCount >= 3 ? "bg-[#A2A2A2] text-[#E4E2E2] pointer-events-none" : "bg-black text-white cursor-pointer"}`}
                                onClick={() => handleIncrement(p)}
                                >+</button>
                        </div>
                    </div>
                </div>
                )
            })}
        </>
    )
}