import { useState, useEffect } from 'react'

const SCREENSAVER_SLIDES = [
    { id: 1, image: '/screensaver/screensaver-1.png'},
    { id: 2, image: '/screensaver/screensaver-2.png'},
    { id: 3, image: '/screensaver/screensaver-3.png'},
    { id: 4, image: '/screensaver/screensaver-4.png'},
    { id: 5, image: '/screensaver/screensaver-5.png'},
]

interface ScreensaverProps {
    onStart: () => void
}

export default function Screensaver({ onStart }: ScreensaverProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [progressKey, setProgressKey] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => {
                setProgressKey((k) => k + 1)
                return (prev + 1) % SCREENSAVER_SLIDES.length;
            })
        }, 6000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        setProgressKey((k) => k + 1)
    }, [currentSlide])

    return (
        <div 
            onClick={onStart}
            className="absolute inset-0 w-full h-full cursor-pointer select-none overflow-hidden bg-black z-30"
        >

            {/* Слайды */}
            {SCREENSAVER_SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img 
                        src={slide.image} 
                        alt={`Промо-фото №${slide.id}`} 
                        className="w-full h-full object-cover" 
                    />

                    {/* Градиент для читаемости текста */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                </div>
            ))}

            {/* Точки с прогресс-баром */}
            <div className="absolute top-10 left-0 right-0 flex justify-center gap-2 z-10">
                {SCREENSAVER_SLIDES.map((_, index) => {
                    const isActive = index === currentSlide;
                    return (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full bg-white/40 overflow-hidden transition-all duration-300 ${
                                isActive ? 'w-10' : 'w-2'
                            }`}
                        >
                            {/* Заполняющаяся шкала для активной точки */}
                            {isActive && (
                                <div 
                                    key={progressKey}
                                    className="h-full bg-white rounded-full animate-progress"
                                    style={{
                                        animationDuration: '6s',
                                        animationTimingFunction: 'linear',
                                        animationFillMode: 'forwards'
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Кнопка */}
            <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center z-10 px-8">
                <div className="bg-white/15 backdrop-blur-md border border-white/30 text-white px-12 py-6 rounded-full text-2xl font-semibold animate-pulse shadow-2xl text-center">
                    Коснитесь экрана, чтобы сделать заказ
                </div>
            </div>
        </div>
    )
}