import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CategoriesTabs() {
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(0)

    const GetCategories = async() => {
        try {
            const response = await fetch("http://localhost:8080/api/get-categories")
            const data = await response.json()

            if (response.ok) {
                setCategories(data["categories"])
            } else {
                toast.error(data["error"])
            }
        } catch (err) {
            console.log("Ошибка сервера", err)
            toast.error("Ошибка сервера")
        }
    }

    useEffect(() => {
        GetCategories()
    }, [])

    return (
        <div className='flex flex-row gap-3 mt-8 px-8 overflow-x-auto whitespace-nowrap scrollbar-hide'
        style={{
            maskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
        }}>
            {categories.map((e, i) => (
                <p key={i} className={
                    `text-lg px-10 py-3.5 my-1 rounded-full shrink-0 whitespace-nowrap
                    transition-all duration-150
                    active:scale-90
                    ${selectedCategory === i ? `bg-black text-white cursor-default`
                         : `bg-gray-300 text-gray-800 cursor-pointer`}`}
                    onClick={() => { setSelectedCategory(i)}}
                >{e}</p>
            ))}
        </div>
    )
}