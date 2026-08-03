import { useState, useEffect, useRef } from 'react'
import { declinationWord } from '../utils/declination'
import confetti from 'canvas-confetti'

interface ApprovedProps {
    isApproved: boolean
    orderNumber: string
    onFinish: () => void
}

export default function Approved({ isApproved, onFinish, orderNumber } : ApprovedProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [timeLeft, setTimeLeft] = useState(30)

    // Таймер автоматического закрытия экрана
    useEffect(() => {
        if (!isApproved) return

        setTimeLeft(30)

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onFinish()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isApproved, onFinish])

    // Конфетти
    useEffect(() => {
        if (!isApproved) return

        // Ищем ближайший родительский блок .kioskframe (или берём сам текущий div)
        const frame = containerRef.current?.closest('.kioskframe') || containerRef.current
        if (!frame) return

        // Создаем кастомный canvas поверх фрейма
        const canvas = document.createElement('canvas')
        canvas.style.position = 'absolute'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.pointerEvents = 'none'
        canvas.style.zIndex = '50'

        frame.appendChild(canvas);

        // Привязываем конфетти к этому canvas
        const myConfetti = confetti.create(canvas, {
            resize: true,
            useWorker: true
        })

        const count = 350
        const defaults = { origin: { y: 0.5, x: 0.5 } } // Центр относительно kioskframe

        function fire(particleRatio: number, opts: any) {
            myConfetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            })
        }

        // Запуск первой волны
        fire(0.25, { spread: 40, startVelocity: 65 })
        fire(0.2, { spread: 80, startVelocity: 45 })
        fire(0.3, { spread: 120, decay: 0.9, scalar: 0.9, startVelocity: 35 })
        fire(0.15, { spread: 150, startVelocity: 30, decay: 0.91, scalar: 1.1 })
        fire(0.1, { spread: 180, startVelocity: 50, decay: 0.92, scalar: 1.3 })

        // Запуск повторных залпов по бокам через 300мс
        const timer = setTimeout(() => {
            myConfetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.3, x: 0.2 },
                colors: ['#ff6b6b', '#ffd93d', '#4ecdc4']
            })
            myConfetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.3, x: 0.8 },
                colors: ['#45b7d1', '#96ceb4', '#6c5ce7']
            })
        }, 300)

        // Очистка при размонтировании
        return () => {
            clearTimeout(timer)
            myConfetti.reset()
            canvas.remove()
        }
    }, [isApproved])

    return (
        <div ref={containerRef} className={`flex flex-col items-center max-h-[1060px] overflow-y-auto pb-27 scrollbar-hide`}>

            <div className={`flex flex-col items-center text-center mt-26`}>
                <div className={`bg-[#4FD829] rounded-full
                    mb-4 px-10 py-10`}>
                    <img 
                        alt="Ошибка" 
                        src="/elements/like.svg" 
                        className={`w-10 h-10`} 
                    />
                </div>

                <div className={`text-3xl font-medium mb-4 tracking-tight
                    border-2 border-[#A2A2A2] px-5 py-3 rounded-full`}>
                    Номер Вашего заказа
                </div>

                <p className={`text-6xl text-black leading-tight max-w-[450px]
                    border-2 border-[#A2A2A2] px-14 py-4 rounded-full font-bold`}>
                    {orderNumber}
                </p>
            </div>

            <div className={`fixed bottom-5 z-20 w-full px-8 flex justify-center`}>
                <div className='flex flex-col gap-2 w-full'>
                    <p className={`text-[#888888] text-lg text-center`}>
                        Этот экран автоматически закроется через
                        {" "}
                        {timeLeft}
                        {" "}
                        {declinationWord(timeLeft, "секунду", "секунды", "секунд")}
                        ...
                    </p>

                    <div 
                        className={`w-full bg-black rounded-full py-5 text-center
                            cursor-pointer active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                        onClick={() => { onFinish() }}>
                            <p className={`text-white text-[24px]`}>
                                Завершить покупку
                            </p>
                    </div>
                </div>
            </div>

        </div>
    )
}