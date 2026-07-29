import SyrupAndAddonChooser from './SyrupAndAddonChooser'
import MilkChooser from './MilkChooser'
import { useState, useEffect, useRef } from 'react'

// Для пропсов
type PopUpProductInfo = {
    name:        string
    unit:        string
    description: string
    image_url:   string 
}

type PopUpVariant = {
    id:            number
    volume:        number
    calories_base: number
    price_base:    number
}

type PopUpOption = {
    id:             number
    group:          string
    name:           string
    volume:         number
    unit:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

// Внутренние типы
type Milk = {
    id:             number
    name:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

type SyrupsAndAddons = {
    id:             number
    name:           string
    volume:         number
    unit:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

interface CustomizationPopUpProps {
    isOpen: boolean
    onClose: () => void
    product: PopUpProductInfo | null
    variants: PopUpVariant[]
    options: PopUpOption[]
    addCart: (p: PopUpVariant, m: Milk | null, o: SyrupsAndAddons[]) => void
}

export default function CustomizationPopUp({ isOpen, onClose, product, variants, options, addCart }: CustomizationPopUpProps) {
    const [selectedVariant, setSelectedVariant] = useState<PopUpVariant | null>(null)

    const [milk, setMilk] = useState<Milk[]>([])
    const [syrups, setSyrups] = useState<SyrupsAndAddons[]>([])
    const [addons, setAddons] = useState<SyrupsAndAddons[]>([])

    const [selectedMilk, setSelectedMilk] = useState<Milk | null>(null)
    const [selectedSyrupsAndAddons, setSelectedSyrupsAndAddons] = useState<SyrupsAndAddons[]>([])
    const [totalCount, setTotalCount] = useState(0) // Количество выбранных сиропов и аддонов (не больше 3)

    const optionsKcalDelta = selectedSyrupsAndAddons.reduce((sum, item) => sum + item.calories_delta, 0)
    const optionsPriceDelta = selectedSyrupsAndAddons.reduce((sum, item) => sum + item.price_delta, 0)

    const handleOptionChange = (option: SyrupsAndAddons, action: 'add' | 'remove') => {
        setSelectedSyrupsAndAddons(prev => {
            if (action === 'add') {
                return [...prev, option]
            } else {
                const indexToRemove = prev.findIndex(item => item.id === option.id)
                if (indexToRemove === -1) return prev

                const newArray = [...prev]
                newArray.splice(indexToRemove, 1)
                return newArray
            }
        })
    }

    // При вызове вариантов находим вариант с минимальным объёмом
    useEffect(() => {
        if (variants && variants.length > 0) {
            const minVar = variants.reduce((min, v) => v.volume < min.volume ? v : min, variants[0])
            setSelectedVariant(minVar)
        } else {
            setSelectedVariant(null)
        }
    }, [variants])

    // Как только пришли новые options (открылся другой товар),
    // сразу вычленяем группы milk, syrup, addon
    // и записываем в стейт
    useEffect(() => {
        if (options && options.length > 0) {
            const milkOptions = options.filter(o => o.group === 'milk')
            const syrupOptions = options.filter(o => o.group === 'syrup')
            const addonOptions = options.filter(o => o.group === 'addon')

            setMilk(milkOptions)
            setSyrups(syrupOptions)
            setAddons(addonOptions)

            setSelectedMilk(milkOptions[0] ?? null) 
        } else {
            setMilk([])
            setSyrups([])
            setAddons([])
            setSelectedMilk(null)
        }

        setSelectedSyrupsAndAddons([])
        setTotalCount(0)
    }, [options])


    // Для скролла к началу карточки при открытии новой
    const scrollRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = 0
        }
    }, [isOpen])

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
                    className={`relative w-[700px] max-h-[950px] bg-[#E4E2E2] 
                    rounded-[80px] overflow-hidden isolate
                    transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}`}
                >
                    <div ref={scrollRef}
                    className="h-full overflow-y-auto scrollbar-hide overscroll-contain px-10 pt-12">

                        <div className="relative flex -mt-15 justify-center shrink-0">
                            <div className="absolute bottom-7 w-40 h-5 bg-black/35 rounded-full blur-md" />
                            <img src={product?.image_url} className="relative z-10 w-96" />
                        </div>

                        <p className="text-[64px] font-semibold text-center leading-15">{product?.name}</p>
                        <p className="text-[24px] font-medium text-[#727171] text-center mt-3">{selectedVariant?.volume} {product?.unit} • {selectedVariant?.calories_base} ккал</p>

                        <div className="w-64 h-[2px] bg-gray-500 mx-auto my-6 shrink-0" />

                        <p className="text-[20px] font-medium max-w-[450px] mx-auto text-gray-500 text-center leading-6">
                            {product?.description}
                        </p>

                        <p className="text-3xl font-semibold mt-8">Размер</p>
                        <div className={`flex flex-row gap-3 mt-4`}>
                            {variants.map((v) => {
                                const isSelected = v.id === selectedVariant?.id
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`flex-1 font-medium text-[22px] py-4 text-center rounded-full
                                            transition-all active:scale-90 duration-300
                                            ${isSelected 
                                                ? "bg-black text-white cursor-default" 
                                                : "bg-[#CBCBCB] text-[#4E4E4E] cursor-pointer"}`}
                                    >
                                        {v.volume} {product?.unit}
                                    </button>
                                )
                            })}
                        </div>
                        
                        {milk.length > 0 && 
                            <>
                                <p className="text-3xl font-semibold mt-8 mb-4">Тип молока</p>
                                <MilkChooser milkInfo={milk} onChange={setSelectedMilk}/>
                            </>
                        }

                        
                            {syrups.length > 0 && 
                                <>
                                    <p className="text-3xl font-semibold mt-8 mb-4">Сиропы</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SyrupAndAddonChooser 
                                         syrupsAndAddons={syrups}
                                         totalCount={totalCount}
                                         onTotalCountChange={setTotalCount}
                                         onChange={handleOptionChange}/>
                                    </div>
                                </>
                            }

                        {addons.length > 0 && 
                            <>
                                <p className="text-3xl font-semibold mt-8 mb-4">Добавки</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <SyrupAndAddonChooser
                                     syrupsAndAddons={addons}
                                     totalCount={totalCount}
                                     onTotalCountChange={setTotalCount}
                                     onChange={handleOptionChange}/>
                                </div>
                            </>
                        }
                        

                        <div className="sticky bottom-0 mt-10 z-20 bg-[#E4E2E2] pb-7">
                            <div 
                                className="pointer-events-none absolute -top-13 left-0 right-0 h-13"
                                style={{
                                    background: 'linear-gradient(to bottom, transparent, #E4E2E2)',
                                }}
                            />

                            <div className="relative flex flex-row gap-3">
                                <div className="bg-[#CBCBCB] text-[#727171] rounded-full flex items-center justify-center text-[22px] font-medium px-8 py-4">
                                    {selectedVariant?.volume} 
                                    {product?.unit} 
                                    {" • "}
                                    {(selectedVariant?.calories_base ?? 0) + (selectedMilk?.calories_delta ?? 0) + optionsKcalDelta}
                                    {" ккал"}
                                    {" • "}
                                    {(selectedVariant?.price_base ?? 0) + (selectedMilk?.price_delta ?? 0) + optionsPriceDelta}₽
                                </div>
                                <button className={`flex-1 bg-black rounded-full flex items-center justify-center text-white text-4xl
                                transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}
                                onClick={() => {
                                    const isMilkValid = milk.length === 0 || selectedMilk !== null

                                    if (selectedVariant && isMilkValid) {
                                        addCart(selectedVariant, selectedMilk, selectedSyrupsAndAddons)
                                    }
                                }}>
                                    +
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
        </div>
    )
}