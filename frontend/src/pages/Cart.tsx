import { useState, useEffect } from 'react'
import BonusEnter from '../components/BonusEnter'
import BonusRegistration from '../components/BonusRegistration'
import BonusVerification from '../components/BonusVerification'
import { declinationWord } from '../utils/declination'
import { toast } from 'sonner'
import type { CartItem } from '../types'

interface CartProps {
    cart: CartItem[]
    onBack: () => void
    onRemove: (index: number) => void
    onNext: () => void
    phone: string
    setPhone: (phone: string) => void
    isBonusProgramDebit: boolean
    setIsBonusProgramDebit: (state: boolean) => void
    bonusesCount: number
    setBonusesCount: (count: number) => void
}

export default function Cart({ 
    cart, 
    onBack, 
    onRemove, 
    onNext, 
    phone,
    setPhone,
    isBonusProgramDebit,
    setIsBonusProgramDebit,
    bonusesCount,
    setBonusesCount
} : CartProps) {
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

    // Вычисляемый статус бонусной программы
    let bonusProgramState: 'noNumber' | 'notVerified' | 'allDone' = 'noNumber'
    if (phone && phone.length === 10) {
        bonusProgramState = isBonusProgramDebit ? 'allDone' : 'notVerified'
    }

    // Состояния видимости модалок
    const [isBonusEnterOpen, setIsBonusEnterOpen] = useState(false)
    const [isBonusRegistrationOpen, setIsBonusRegistrationOpen] = useState(false)
    const [isBonusVerificationOpen, setIsBonusVerificationOpen] = useState(false)
    
    // Режим верификации: 'registration' (подтверждение регистрации) или 'debit' (подтверждение списания)
    const [verificationMode, setVerificationMode] = useState<'registration' | 'debit'>('debit')
    const [pendingRegistrationPhone, setPendingRegistrationPhone] = useState("")

    const usedBonuses = bonusProgramState === 'allDone' 
        ? Math.min(totalCartPrice, bonusesCount) 
        : 0

    const finalPrice = Math.max(0, totalCartPrice - usedBonuses)

    const bonusesLeft = bonusProgramState === 'allDone' 
        ? Math.max(0, bonusesCount - totalCartPrice) 
        : bonusesCount

    // Вход по номеру
    const handleBonusEnterClose = async (enteredPhone: string) => {
        try {
            setPhone(enteredPhone)

            const response = await fetch('http://localhost:8080/api/user/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: enteredPhone }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                setBonusesCount(data["bonuses"])
                setIsBonusEnterOpen(false)
            } else {
                setPhone("")
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Старт регистрации
    const handleBonusRegistrationClose = async (enteredPhone?: string) => {
        try {
            const currentPhone = enteredPhone ?? pendingRegistrationPhone 
            if (currentPhone.length !== 10) {
                setIsBonusRegistrationOpen(false)
                return
            }

            setPendingRegistrationPhone(currentPhone)

            const response = await fetch('http://localhost:8080/api/user/start-registration', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: currentPhone }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                setIsBonusRegistrationOpen(false)
                setVerificationMode('registration')
                setIsBonusVerificationOpen(true)
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Верификация регистрации
    const handleBonusRegistrationVerificationClose = async (code: string) => {
        try {
            if (pendingRegistrationPhone.length !== 10 || code.length !== 6) {
                setIsBonusVerificationOpen(false)
                return
            }

            const response = await fetch('http://localhost:8080/api/user/verify-registration', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: pendingRegistrationPhone, code: code }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                setPhone(pendingRegistrationPhone)
                setBonusesCount(data["bonuses"])
                setIsBonusVerificationOpen(false)
                toast.success(data["message"])
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Запрос SMS для списания бонусов
    const handleBonusVerification = async (enteredPhone?: string) => {
        try {
            const currentPhone = enteredPhone ?? phone
            if (currentPhone.length !== 10) {
                toast.error("Введите номер полностью")
                return
            }

            setVerificationMode('debit')
            setIsBonusVerificationOpen(true)

            const response = await fetch('http://localhost:8080/api/user/start-verification', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: currentPhone }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                toast.success("Сообщение с кодом отправлено")
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }
    
    // Подтверждение списания бонусов кодом
    const handleBonusVerificationClose = async (code: string) => {
        try {
            if (phone.length !== 10 || code.length !== 6) {
                setIsBonusVerificationOpen(false)
                return
            }

            const response = await fetch('http://localhost:8080/api/user/verify', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phone, code: code, price: totalCartPrice }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                setIsBonusProgramDebit(true)
                setIsBonusVerificationOpen(false)
                setBonusesCount(data["bonuses"])
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Отмена списания бонусов
    const handleBonusVerificationCancel = async () => {
        try {
            if (!isBonusProgramDebit || phone.length !== 10) return

            const response = await fetch('http://localhost:8080/api/user/verify/cancel', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phone }),
                credentials: "include"
            })
            const data = await response.json()

            if (response.ok) {
                setIsBonusProgramDebit(false)
                toast.success(data["message"])
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера: ", err)
            toast.error("Ошибка сервера")
        }
    }

    // Полный выход из профиля по нажатию на кнопку
    const handleLogout = () => {
        if (bonusProgramState === 'allDone') {
            handleBonusVerificationCancel()
        }
        setPhone("")
        setIsBonusProgramDebit(false)
        setBonusesCount(0)
    }

    return (
        <div className="flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide mt-6">
            
            <div 
                className="flex flex-row gap-1 self-start w-full bg-black items-center px-8 py-[16px] rounded-full cursor-pointer active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
                onClick={onBack}
            >
                <img alt='Назад' src='elements/back.svg' className="h-5 w-5" />
                <p className="text-white text-[22px] pl-2">Назад</p>
            </div>
            
            <div className="flex flex-col self-start gap-3">
                 <div className="flex flex-row items-center mt-3 gap-3 transition-all duration-200">
                    <span 
                        className={`text-[20px] font-medium shrink-0 cursor-pointer text-center px-10 py-3 rounded-full transition-all duration-200 ${
                            bonusProgramState === 'noNumber'
                                ? "bg-[#CBCBCB] text-[#4E4E4E]" 
                                : "bg-black text-white"
                        }`}
                        onClick={() => { 
                            if (bonusProgramState === 'noNumber') {
                                setIsBonusEnterOpen(true)
                            } else {
                                handleLogout()
                            }
                        }}
                    >
                        {bonusProgramState === 'noNumber' ? "Бонусная система" : "Выйти из профиля"}
                    </span>
                    <span className="flex-1 text-[18px] font-medium text-[#727171] w-full">
                        {bonusProgramState === "noNumber" ? (
                            <>
                                Вы можете получить {Math.floor(finalPrice / 10)}{" "}
                                {declinationWord(Math.floor(finalPrice / 10), "бонус", "бонуса", "бонусов")} за этот заказ
                            </>
                        ) : (
                            <>
                                Мы начислим {Math.floor(finalPrice / 10)}{" "}
                                {declinationWord(Math.floor(finalPrice / 10), "бонус", "бонуса", "бонусов")} за этот заказ
                            </>
                        )}
                    </span> 
                </div>

                 <div className={`flex flex-row items-center gap-3 transition-all duration-200 ${
                    bonusProgramState !== 'noNumber' ? "opacity-100 cursor-pointer mb-3" : "opacity-0 pointer-events-none max-h-0 !m-0 !p-0"
                 }`}>
                    <span 
                        className={`text-[20px] font-medium shrink-0 text-center px-12.5 py-3 rounded-full transition-all duration-200 ${
                            bonusProgramState === 'allDone'
                                 ? "bg-black text-white" 
                                 : "bg-[#CBCBCB] text-[#4E4E4E]"
                        }`}
                        onClick={() => {
                            if (bonusProgramState === "allDone") {
                                handleBonusVerificationCancel()
                            } else {
                                handleBonusVerification()
                            }
                        }}
                    >
                        {bonusProgramState === 'allDone' ? "Отменить списание" : "Списать бонусы"}
                    </span>
                    <span className="flex-1 text-[18px] font-medium text-[#727171] w-full">
                        {bonusProgramState === "notVerified" && (
                            <>
                                На Вашем счете {bonusesCount}{" "}
                                {declinationWord(bonusesCount, "бонус", "бонуса", "бонусов")}
                            </>
                        )}
                        {bonusProgramState === "allDone" && (
                            <>
                                После покупки у вас останется {bonusesLeft + Math.floor(finalPrice / 10)}{" "}
                                {declinationWord((bonusesLeft + Math.floor(finalPrice / 10)), "бонус", "бонуса", "бонусов")}
                            </>
                        )}
                    </span> 
                </div>
            </div>

            {/* Карточки товаров */}
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
                        className={`flex items-center gap-3 p-4 self-start w-full bg-[#E4E2E2] rounded-3xl pr-6 transition-all duration-300 ease-out overflow-hidden ${
                            isDeleting ? 'opacity-0 scale-95 -translate-x-10 max-h-0 !p-0 !mb-0' : 'max-h-48 opacity-100 mb-3'
                        }`}
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
                            className="w-12 h-12 bg-[#929191] rounded-full flex items-center justify-center shrink-0 ml-2 transition-all duration-100 active:scale-90 active:bg-red-600 cursor-pointer"
                            onClick={() => handleRemove(index)}
                        >
                            <img alt="Удалить товар" src="elements/trash.svg" className="h-6 w-6" />
                        </button>
                    </div>
                )
            })}

            <div className="fixed flex w-full bottom-5 z-20 px-8">
                <div 
                    className="w-full bg-black text-white px-10 py-5 text-2xl text-center rounded-full transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
                    onClick={onNext}
                >
                    К оплате • {finalPrice} ₽
                </div>
            </div>

            {/* --- МОДАЛКИ --- */}
            <BonusEnter
                isBonusEnterOpen={isBonusEnterOpen} 
                initialPhone={phone}
                bonusProgramState={bonusProgramState}
                onBasicClose={() => setIsBonusEnterOpen(false)}
                onBonusEnterClose={handleBonusEnterClose}
                onSwitchToRegistration={() => {
                    setIsBonusEnterOpen(false)
                    setIsBonusRegistrationOpen(true)
                }} 
            />

            <BonusRegistration 
                isBonusRegistrationOpen={isBonusRegistrationOpen}
                onBasicClose={() => setIsBonusRegistrationOpen(false)}
                onBonusRegistrationClose={handleBonusRegistrationClose} 
            />

            {/* Единственная экземпляризиция модалки верификации */}
            <BonusVerification
                isBonusVerificationOpen={isBonusVerificationOpen}
                initialPhone={verificationMode === 'registration' ? pendingRegistrationPhone : phone}
                resendCode={verificationMode === 'registration' 
                    ? () => handleBonusRegistrationClose(pendingRegistrationPhone) 
                    : () => handleBonusVerification(phone)
                }
                onBasicClose={() => setIsBonusVerificationOpen(false)}
                onBonusVerificationClose={verificationMode === 'registration' 
                    ? handleBonusRegistrationVerificationClose 
                    : handleBonusVerificationClose
                }
            />
        </div>
    )
}