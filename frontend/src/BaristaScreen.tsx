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

// Цветовые палитры для разных уровней срочности заказа
const THEMES = {
    normal: { // 0–10 минут (Зеленый)
        cardBg: "bg-[#DCFCE7]",
        headerBadgeBg: "bg-[#86EFAC]",
        headerBadgeBorder: "border-[#16A34A]",
        headerBadgeText: "text-[#14532D]",
        headerBorder: "border-[#86EFAC]",
        itemBoxBg: "bg-[#4ADE80]",
        itemBoxBorder: "border-[#16A34A]",
        itemTitleBg: "bg-[#14532D]",
        itemTitleText: "text-[#F0FDF4]",
        itemVolumeBg: "bg-[#15803D]",
        itemVolumeText: "text-[#F0FDF4]",
        milkBoxBg: "bg-[#16A34A]",
        milkTitleText: "text-[#F0FDF4]",
        milkBadgeBg: "bg-[#DCFCE7]",
        additivesBoxBg: "bg-[#16A34A]",
        additivesTitleText: "text-[#F0FDF4]",
        additivesBadgeBg: "bg-[#DCFCE7]",
        additivesBadgeText: "text-[#14532D]",
        buttonBg: "bg-[#14532D]"
    },
    warning: { // 10–15 минут (Желтый)
        cardBg: "bg-[#FEF08A]",
        headerBadgeBg: "bg-[#FDE047]",
        headerBadgeBorder: "border-[#CA8A04]",
        headerBadgeText: "text-[#713F12]",
        headerBorder: "border-[#FDE047]",
        itemBoxBg: "bg-[#EAB308]",
        itemBoxBorder: "border-[#CA8A04]",
        itemTitleBg: "bg-[#713F12]",
        itemTitleText: "text-[#FEFCE8]",
        itemVolumeBg: "bg-[#A16207]",
        itemVolumeText: "text-[#FEFCE8]",
        milkBoxBg: "bg-[#CA8A04]",
        milkTitleText: "text-[#FEFCE8]",
        milkBadgeBg: "bg-[#FEF9C3]",
        additivesBoxBg: "bg-[#CA8A04]",
        additivesTitleText: "text-[#FEFCE8]",
        additivesBadgeBg: "bg-[#FEF9C3]",
        additivesBadgeText: "text-[#713F12]",
        buttonBg: "bg-[#713F12]"
    },
    urgent: { // > 15 минут (Красный)
        cardBg: "bg-[#FEE2E2]",
        headerBadgeBg: "bg-[#FCA5A5]",
        headerBadgeBorder: "border-[#DC2626]",
        headerBadgeText: "text-[#7F1D1D]",
        headerBorder: "border-[#FCA5A5]",
        itemBoxBg: "bg-[#F87171]",
        itemBoxBorder: "border-[#DC2626]",
        itemTitleBg: "bg-[#7F1D1D]",
        itemTitleText: "text-[#FEF2F2]",
        itemVolumeBg: "bg-[#991B1B]",
        itemVolumeText: "text-[#FEF2F2]",
        milkBoxBg: "bg-[#DC2626]",
        milkTitleText: "text-[#FEF2F2]",
        milkBadgeBg: "bg-[#FEE2E2]",
        additivesBoxBg: "bg-[#DC2626]",
        additivesTitleText: "text-[#FEF2F2]",
        additivesBadgeBg: "bg-[#FEE2E2]",
        additivesBadgeText: "text-[#7F1D1D]",
        buttonBg: "bg-[#7F1D1D]"
    }
}

export default function BaristaScreen() {
    const [orders, setOrders] = useState<Order[]>([])
    const [now, setNow] = useState<number>(Date.now())
    
    // Сортируем заказы: старые выше, новые ниже
    const sortedOrders = [...orders].sort((a, b) => {
        return new Date(a.common_order_info.updated_at).getTime() - new Date(b.common_order_info.updated_at).getTime()
    })

    // Получение новых заказов с сервера
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

    const OrderReady = async (orderUUID: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/barista/order-ready`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_uuid: orderUUID }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                toast.success(`Заказ ${data["order_client_number"]} завершен!`)
                GetNewOrders()
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Поллинг заказов раз в 5 сек + обновление метки времени раз в 10 сек для автосмены цвета
    useEffect(() => {
        GetNewOrders()

        const intervalOrders = setInterval(GetNewOrders, 5000)
        const intervalTimer = setInterval(() => setNow(Date.now()), 10000)

        return () => {
            clearInterval(intervalOrders)
            clearInterval(intervalTimer)
        }
    }, [])

    // Вычисление категории срочности по времени заказа
    const getUrgencyLevel = (updatedAt: string): 'normal' | 'warning' | 'urgent' => {
        const orderTime = new Date(updatedAt).getTime()
        const diffMinutes = (now - orderTime) / (1000 * 60)

        if (diffMinutes >= 15) return 'urgent'
        if (diffMinutes >= 10) return 'warning'
        return 'normal'
    }

    // Расчет условной высоты заказа для балансировки колонок
    const getOrderScore = (order: Order) => {
        let score = 2
        order.goods?.forEach((item) => {
            score += 3
            score += item.options?.length || 0
        })
        return score
    }

    // Распределяем заказы по двум колонкам
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

    // Рендер карточки заказа с индивидуальной палитрой
    const renderOrderCard = (order: Order) => {
        const urgency = getUrgencyLevel(order.common_order_info.updated_at)
        const theme = THEMES[urgency]

        const sortedGoods = [...(order.goods || [])].sort((a, b) => 
            a.product.name.localeCompare(b.product.name)
        )

        return (
            <div key={order.common_order_info.order_uuid} className={`${theme.cardBg} rounded-3xl p-4 h-fit transition-colors duration-500`}>
                {/* Номер заказа и время */}
                <div className={`flex flex-row gap-2 border-b-2 pb-3 ${theme.headerBorder}`}>
                    <p className={`font-semibold text-[24px] ${theme.headerBadgeBg} ${theme.headerBadgeText} rounded-full px-4 border-2 ${theme.headerBadgeBorder}`}>
                        {order.common_order_info.order_client_number}
                    </p>
                    <p className={`font-semibold text-[24px] ${theme.headerBadgeBg} ${theme.headerBadgeText} rounded-full px-4 border-2 ${theme.headerBadgeBorder}`}>
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
                            <div key={itemKey} className={`flex flex-col ${theme.itemBoxBg} border-2 ${theme.itemBoxBorder} rounded-2xl p-2 items-center text-center transition-colors duration-500`}>
                                
                                {/* Название и объем */}
                                <div className="flex w-full flex-col gap-1.25 items-center rounded-2xl">
                                    <p className={`w-full font-extrabold ${theme.itemTitleBg} ${theme.itemTitleText} rounded-2xl px-6 py-3 text-[32px] leading-7.5`}>
                                        {item.product.name}
                                    </p>
                                    <p className={`w-full ${theme.itemVolumeBg} ${theme.itemVolumeText} rounded-full font-extrabold text-[18px] px-4 py-0.5`}>
                                        {item.product.volume} {item.product.unit}
                                    </p>
                                </div>

                                {/* Молоко */}
                                {milk.length > 0 && (
                                    <div className={`flex flex-col w-full mt-3 ${theme.milkBoxBg} p-2 rounded-2xl`}>
                                        <p className={`font-extrabold text-[24px] ${theme.additivesBadgeText} ${theme.milkBadgeBg} rounded-full mb-2`}>
                                            Молоко
                                        </p>
                                        <p className={`flex-1 ${theme.milkBadgeBg} ${theme.additivesBadgeText} rounded-full font-extrabold text-[18px]`}>
                                            {milk[0].name}
                                        </p>
                                    </div>
                                )}

                                {/* Добавки */}
                                {additives.length > 0 && (
                                    <div className={`flex flex-col w-full mt-2 ${theme.additivesBoxBg} p-2 rounded-2xl`}>
                                        <p className={`flex-1 ${theme.milkBadgeBg} ${theme.additivesBadgeText} rounded-full font-extrabold text-[24px] mb-2`}>Добавки</p>
                                        <div className="flex flex-col gap-[7px]">
                                            {additives.map((add, aIdx) => (
                                                <div key={`${add.name}-${aIdx}`} className="flex flex-row gap-1">
                                                    <p className={`flex-[75%] font-extrabold ${theme.additivesBadgeBg} ${theme.additivesBadgeText} rounded-full text-[18px]`}>
                                                        {add.group === 'syrup' ? `${add.name} сироп` : add.name}
                                                    </p>
                                                    <p className={`flex-[25%] ${theme.additivesBadgeBg} ${theme.additivesBadgeText} rounded-full font-extrabold text-[18px]`}>
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

                    <button className={`flex ${theme.buttonBg} py-3 rounded-full items-center justify-center
                        transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        active:scale-95 cursor-pointer`}
                        onClick={() => {
                            OrderReady(order.common_order_info.order_uuid)
                        }}>
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