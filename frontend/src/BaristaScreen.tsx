import { useEffect, useState } from "react"
import KioskFrame from "./KioskFrame"
import { Toaster, toast } from 'sonner'

type CommonOrderInfo = {
    order_uuid: string
    order_client_number: string
    updated_at: string
}

type Product = {
    name: string
    volume: string
    unit: string
}

type Option = {
    name: string
    group: string
    volume: string
    unit: string
}

type OrderPiece = {
    product: Product
    options: Option[]
}

type Order = {
    common_order_info: CommonOrderInfo
    goods: OrderPiece[]
}

export default function BaristaScreen() {
    const [orders, setOrders] = useState<Order[]>([])
    
    // Сортируем заказы: старые выше, новые ниже
    const sortedOrders = [...orders].sort((a, b) => {
        return new Date(a.common_order_info.updated_at).getTime() - new Date(b.common_order_info.updated_at).getTime()
    })

    const GetNewOrders = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/barista/get-new-orders")
            const data = await response.json()

            if (response.ok) {
                setOrders(data["orders"] || [])
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
        }
    }

    // Поллинг каждые 5 секунд
    useEffect(() => {
        GetNewOrders()

        const interval = setInterval(() => {
            GetNewOrders()
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    // Расчет условной высоты заказа для балансировки колонок
    const getOrderScore = (order: Order) => {
        let score = 2 // Базовый вес (номер заказа + кнопка)
        order.goods?.forEach((item) => {
            score += 3 // Вес самого товара
            score += item.options?.length || 0 // Вес каждой добавки/молока
        })
        return score
    }

    // Распределяем заказы по двум колонкам (туда, где меньше суммарная высота)
    const leftColumn: Order[] = []
    const rightColumn: Order[] = []
    let leftHeight = 0
    let rightHeight = 0

    sortedOrders.forEach((order) => {
        const score = getOrderScore(order)
        if (leftHeight <= rightHeight) {
            leftColumn.push(order)
            leftHeight += score
        } else {
            rightColumn.push(order)
            rightHeight += score
        }
    })

    // Рендер отдельной карточки заказа
    const renderOrderCard = (order: Order) => {
        const sortedGoods = [...(order.goods || [])].sort((a, b) => 
            a.product.name.localeCompare(b.product.name)
        )

        return (
            <div key={order.common_order_info.order_uuid} className="bg-[#E4E2E2] rounded-3xl p-4 h-fit">
                {/* Номер заказа и время */}
                <div className="flex flex-row gap-2 border-b-2 pb-3 border-[#D1CDCD]">
                    <p className="font-semibold text-[24px] bg-[#D1CDCD] rounded-full px-4 border-2 border-[#A2A2A2]">
                        {order.common_order_info.order_client_number}
                    </p>
                    <p className="font-semibold text-[24px] bg-[#D1CDCD] rounded-full px-4 border-2 border-[#A2A2A2]">
                        {new Date(order.common_order_info.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Список товаров */}
                <div className="flex flex-col gap-3 mt-3">
                    {sortedGoods.map((item, itemIndex) => {
                        const options = item.options || []
                        const milk = options.filter(opt => opt.group === 'milk')
                        
                        const additives = options
                            .filter(opt => opt.group !== 'milk')
                            .sort((a, b) => a.name.localeCompare(b.name))

                        const itemKey = `${item.product.name}-${item.product.volume}-${itemIndex}`

                        return (
                            <div key={itemKey} className="flex flex-col bg-[#CCCCCC] border-2 border-[#9c9b9b] rounded-2xl p-2 items-center text-center">
                                
                                {/* Название и объем */}
                                <div className="flex w-full flex-col gap-1.25 items-center rounded-2xl">
                                    <p className="w-full font-extrabold bg-[#383838] rounded-2xl px-6 py-3 text-[32px] text-[#ebe9e9] leading-7.5">
                                        {item.product.name}
                                    </p>
                                    <p className="w-full bg-[#696968] rounded-full font-extrabold text-[18px] px-4 py-0.5 text-[#ebe9e9]">
                                        {item.product.volume} {item.product.unit}
                                    </p>
                                </div>

                                {/* Молоко */}
                                {milk.length > 0 && (
                                    <div className="flex flex-col w-full mt-3 bg-[#A5A5A5] p-2 rounded-2xl">
                                        <p className="font-extrabold text-[24px] text-[#3E3C3C] bg-[#d2d0d0] rounded-full mb-2">Молоко</p>
                                        <p className="flex-1 bg-[#d2d0d0] rounded-full font-extrabold text-[18px] text-[#3E3C3C]">
                                            {milk[0].name}
                                        </p>
                                    </div>
                                )}

                                {/* Добавки */}
                                {additives.length > 0 && (
                                    <div className="flex flex-col w-full mt-2 bg-[#a7a7a7] p-2 rounded-2xl">
                                        <p className="flex-1 bg-[#d2d0d0] rounded-full font-extrabold text-[24px] text-[#3E3C3C] mb-2">Добавки</p>
                                        <div className="flex flex-col gap-[7px]">
                                            {additives.map((add, aIdx) => (
                                                <div key={`${add.name}-${aIdx}`} className="flex flex-row gap-1">
                                                    <p className="flex-[75%] font-extrabold bg-[#d2d0d0] rounded-full text-[18px] text-[#3E3C3C]">
                                                        {add.group === 'syrup' ? `${add.name} сироп` : add.name}
                                                    </p>
                                                    <p className="flex-[25%] bg-[#d2d0d0] rounded-full font-extrabold text-[18px] text-[#3E3C3C]">
                                                        {add.volume} {add.unit}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <button className="flex bg-black py-3 rounded-full items-center justify-center
                        transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        active:scale-95 cursor-pointer">
                        <img alt="Готово" src="elements/apply.svg" className="w-7 h-7" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <KioskFrame>
            <Toaster
                position="top-center"
                style={{ fontFamily: "MyFont, sans-serif" }}
            />

            <div className="flex flex-col h-full w-full overflow-hidden">

                {/* Хэдер */}
                <div className="flex flex-col w-full shrink-0">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-extrabold text-[64px] leading-none">PERKLY</p>
                        <p className="font-extrabold text-[24px] px-6 py-1 border-3 border-[#A2A2A2] rounded-full text-[#3E3C3C]">
                            АКТИВНЫХ ЗАКАЗОВ: {orders.length}
                        </p>
                    </div>

                    <div className="flex flex-row justify-between items-center mt-2">
                        <p className="font-extrabold text-[32px] leading-none">ПАНЕЛЬ БАРИСТА</p>
                        <p className="font-extrabold text-[24px] px-6 py-[0.5px] border-3 border-[#A2A2A2] rounded-full text-[#3E3C3C]">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Область скролла для заказов */}
                <div 
                    className="flex-1 min-h-0 overflow-y-auto mt-4 scrollbar-hide"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)'
                    }}
                >
                    <div className="flex flex-row gap-3 items-start pt-2 pb-20 pt-5">
                        {/* Левая колонка */}
                        <div className="flex flex-col gap-3 flex-1">
                            {leftColumn.map(renderOrderCard)}
                        </div>

                        {/* Правая колонка */}
                        <div className="flex flex-col gap-3 flex-1">
                            {rightColumn.map(renderOrderCard)}
                        </div>
                    </div>
                </div>

            </div>
        </KioskFrame>
    )
}