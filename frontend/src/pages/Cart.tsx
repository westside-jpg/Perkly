import { useState, useEffect } from 'react'
import BonusEnter from '../components/BonusEnter'
import { declinationWord } from '../utils/declination'
import type { CartItem } from '../types'
import BonusRegistration from '../components/BonusRegistration'
import BonusVerification from '../components/BonusVerification'
import { toast } from 'sonner'

interface CartProps {
    cart: CartItem[]
    onBack: () => void
    onRemove: (index: number) => void
}

export default function Cart({ cart, onBack, onRemove } : CartProps) {
    const totalCartPrice = cart.reduce((total, item) => {
        const milkPrice = item.milk?.price_delta ?? 0
        const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price_delta, 0)

        return total + item.variant.price_base + milkPrice + optionsPrice
    }, 0)

    const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
    const handleRemove = (index: number) => {
        setDeletingIndex(index)
        setTimeout(() => {
            onRemove(index)
            setDeletingIndex(null)
        }, 300)
    }

    const [bonusProgramState, setBonusProgramState] = useState<'noNumber' | 'notVerified' | 'allDone'>('noNumber')
    const [isBonusEnterOpen, setIsBonusEnterOpen] = useState(false)
    const [isBonusRegistrationOpen, setIsBonusRegistrationOpen] = useState(false)
    const [isBonusVerificationOpen, setIsBonusVerificationOpen] = useState(false)

    const [phone, setPhone] = useState('')
    const [bonusesCount, setBonusesCount] = useState(0)
    const [bonusesLeft, setBonusesLeft] = useState(0)

    const handleBonusEnterClose = async (enteredPhone: string) => {
        setPhone(enteredPhone)

        const response = await fetch('http://localhost:8080/api/user/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setBonusesCount(data["bonuses"])
            setBonusProgramState('notVerified')
            setIsBonusEnterOpen(false)
        } else {
            setBonusProgramState('noNumber')
            toast.error(data["error"])
        }
    }

    const handleBonusRegistrationClose = async (enteredPhone: string) => {
        setPhone(enteredPhone)

        if (phone.length != 10) {
            setPhone("")
            setIsBonusRegistrationOpen(false)
            return
        }

        const response = await fetch('http://localhost:8080/api/user/start-registration', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setIsBonusRegistrationOpen(false)
            setIsBonusVerificationOpen(true)
        } else {
            toast.error(data["error"])
        }
    }

    const handleBonusRegistrationVerificationClose = async (code: string) => {

        if ((phone.length != 10) || (code.length != 6)) {
            setPhone("")
            setIsBonusVerificationOpen(false)
            return
        }

        const response = await fetch('http://localhost:8080/api/user/verify-registration', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone, code: code }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setBonusesCount(data["bonuses"])
            setBonusProgramState("notVerified")
            setIsBonusVerificationOpen(false)
            toast.success(data["message"])
        } else {
            toast.error(data["error"])
        }
    }

    // Для отправки кода при нажатии на кнопку списать бонусы
    const handleBonusVerification = async () => {

        if (phone.length != 10) {
            toast.error("Введите номер полностью")
            return
        }

        const response = await fetch('http://localhost:8080/api/user/start-verification', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setIsBonusVerificationOpen(true)
        } else {
            toast.error(data["error"])
        }
    }
    
    // Валидация кода для списания бонусов
    const handleBonusVerificationClose = async (code: string) => {

        if ((phone.length != 10) || (code.length != 6)) {
            setIsBonusVerificationOpen(false)
            return
        }

        const response = await fetch('http://localhost:8080/api/user/verify', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone, code: code, price: totalCartPrice}),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setBonusProgramState("allDone")
            setIsBonusVerificationOpen(false)
            setBonusesLeft(data["bonuses_left"])
        } else {
            toast.error(data["error"])
        }
    }

    // Отмена списания бонусов (повторное нажатие на кнопку)
    const handleBonusVerificationCancel = async () => {

        if (phone.length != 10) {
            toast.error("Введите номер полностью")
            return
        }

        const response = await fetch('http://localhost:8080/api/user/verify/cancel', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
            setBonusProgramState("notVerified")
            setBonusesLeft(0)
            toast.success(data["message"])
        } else {
            toast.error(data["error"])
        }
    }


    return (
        <div className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide`}>
            
            <div 
            className={`flex flex-row gap-1 self-start w-full bg-black items-center px-8 py-[16px] rounded-full
                cursor-pointer active:scale-95 transition-all duration-200`}
            onClick={() => { onBack() }}>
                <img alt='Назад' src='elements/back.svg'
                className={`h-5 w-5`} />
                <p className={`text-white text-[22px] pl-2`}>Назад</p>
            </div>
            
            <div className={`flex flex-col self-start gap-3`}>
                 <div className={`flex flex-row items-center mt-3 gap-3 transition-all duration-200`}>
                    <span className={`text-[20px] font-medium shrink-0
                        text-center px-10 py-3 rounded-full transition-all duration-200
                        ${(bonusProgramState == 'noNumber') || (bonusProgramState == 'notVerified')
                            ? "cursor-pointer active:scale-90"
                            : "cursor-default pointer-events-none"}
                        ${bonusProgramState == 'noNumber'
                             ? "bg-[#CBCBCB] text-[#4E4E4E]" 
                             : "bg-black text-white"}`}
                        onClick={() => { 
                            setIsBonusEnterOpen(true)
                        }}>
                        Бонусная система
                    </span>
                    <span className={`flex-1 text-[18px] font-medium
                        text-[#727171] w-full`}>
                        Мы начислим
                        {" "}
                        {Math.floor(totalCartPrice / 10)}
                        {" "}
                        {declinationWord(Math.floor(totalCartPrice / 10), "бонус", "бонуса", "бонусов")}
                        {" "}
                        за этот заказ
                    </span> 
                </div>
                 <div className={`flex flex-row items-center gap-3 transition-all duration-200
                    ${bonusProgramState != 'noNumber' ? "opacity-100 cursor-pointer mb-3" : "opacity-0 pointer-events-none max-h-0 !m-0 !p-0"}`}>
                    <span className={`text-[20px] font-medium bg-[#CBCBCB] shrink-0
                        text-[#4E4E4E] text-center px-12.5 py-3 rounded-full`}
                        onClick={() => {
                            if (bonusProgramState == "allDone") {
                                handleBonusVerificationCancel()
                            } else {
                                handleBonusVerification()
                            }
                        }}>
                        Списать бонусы
                    </span>
                    <span className={`flex-1 text-[18px] font-medium
                        text-[#727171] w-full`}>
                        {bonusProgramState == "notVerified" &&
                        <>
                            На Вашем счете
                            {" "}
                            {declinationWord(bonusesCount, "бонус", "бонуса", "бонусов")}
                        </>}
                        {bonusProgramState == "allDone" && 
                        <>
                            После покупки у вас останется
                            {" "}
                            {declinationWord(bonusesLeft, "бонус", "бонуса", "бонусов")}
                        </>}
                    </span> 
                </div>
            </div>

            {cart.map((item, index) => {
                const isDeleting = deletingIndex === index

                const itemPrice = item.variant.price_base + 
                    (item.milk?.price_delta ?? 0) + 
                    item.options.reduce((sum, opt) => sum + opt.price_delta, 0)

                const itemKcal = item.variant.calories_base + 
                    (item.milk?.calories_delta ?? 0) + 
                    item.options.reduce((sum, opt) => sum + opt.calories_delta, 0)

                return (
                    <div 
                        key={`${item.variant.id}-${index}`}
                        className={`flex items-center gap-3 p-4 self-start w-full bg-[#E4E2E2] rounded-3xl pr-6
                            transition-all duration-300 ease-out overflow-hidden
                            ${isDeleting ? 'opacity-0 scale-95 -translate-x-10 max-h-0 !p-0 !mb-0' : 'max-h-48 opacity-100 mb-3'}`}
                    >
                        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                            <div className="absolute bottom-2 w-20 h-3 bg-black/50 rounded-full blur-sm" />
                            <img 
                                src={item.productInfo.image_url}
                                alt={item.productInfo.name}
                                className="relative z-10 w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-3 font-medium text-[27px]">
                                <span className="text-black rounded-full pb-1 text-3xl font-semibold">
                                    {item.productInfo.name}
                                </span>
                                <span className="text-black">|</span>
                                <span className="bg-black text-white rounded-full px-3 py-1 text-[18px] font-bold">
                                    {itemPrice} ₽
                                </span>
                            </div>

                            <p className="text-[#727171] text-[17px] font-medium">
                                {item.variant.volume} {item.productInfo.unit} • {itemKcal} ккал
                            </p>

                            {item.milk && (
                                <p className="text-[16px] text-[#727171] mt-1 font-medium">
                                    Молоко: <span className="text-[#727171]">{item.milk.name}</span>
                                </p>
                            )}

                            {item.options.length > 0 && (
                                <div className="text-[16px] text-[#727171] font-medium">
                                    Добавки:{" "}
                                    <span className="text-[#727171]">
                                        {item.options
                                            .map((opt) => opt.group === 'syrup' ? `${opt.name} сироп` : opt.name)
                                            .join(", ")}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="w-12 h-12 bg-[#929191]
                                    rounded-full flex items-center justify-center shrink-0 ml-2
                                    transition-all duration-100 active:scale-90 active:bg-red-600 cursor-pointer"
                            onClick={() => handleRemove(index)}
                        >
                            <img 
                                alt="Удалить товар" 
                                src="elements/trash.svg"
                                className="h-6 w-6" 
                            />
                        </button>
                    </div>
                )
            })}

            <div className={`fixed flex bottom-5 left-20 right-20 z-20 px-8`}>
                    <div className={`w-full bg-black text-white px-10 py-5 text-2xl text-center rounded-full
                    transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}>
                        К оплате
                        {" • "}
                        {bonusProgramState != "allDone" && totalCartPrice}
                        {bonusProgramState == "allDone" && totalCartPrice + (bonusesLeft - bonusesCount)}
                        ₽
                    </div>
            </div>

            <BonusEnter
            isBonusEnterOpen={isBonusEnterOpen} 
            initialPhone={phone}
            onBonusEnterClose={handleBonusEnterClose}
            onSwitchToRegistration={() => {
                setIsBonusEnterOpen(false)
                setIsBonusRegistrationOpen(true)
                setPhone("")
            }} />

            <BonusRegistration 
            isBonusRegistrationOpen={isBonusRegistrationOpen}
            onBonusRegistrationClose={handleBonusRegistrationClose} />

            {/* Модалка ввода кода при регистрации */}
            {bonusProgramState == 'noNumber' && <BonusVerification
            isBonusVerificationOpen={isBonusVerificationOpen}
            initialPhone={phone}
            onBonusVerificationClose={handleBonusRegistrationVerificationClose}
            />}

            {/* Модалка ввода кода при списании бонусов */}
            {bonusProgramState == 'notVerified' && <BonusVerification
            isBonusVerificationOpen={isBonusVerificationOpen}
            initialPhone={phone}
            onBonusVerificationClose={handleBonusVerificationClose}
            />}


        </div>
    )
    
}