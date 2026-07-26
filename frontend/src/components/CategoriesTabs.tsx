import { useState } from 'react'

type Category = {
    id: number
    name: string
}

type CategoriesTabsProps = {
    categories: Category[]
}

export default function CategoriesTabs({ categories }: CategoriesTabsProps) {
    const [selectedCategory, setSelectedCategory] = useState(0)

    return (
        <div className='flex flex-row gap-3 mt-8 px-8 overflow-x-auto whitespace-nowrap scrollbar-hide'
        style={{
            maskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
        }}>
            {categories.map((category, i) => (
                <p key={category.id} className={
                    `text-lg px-10 py-3.5 my-1 rounded-full shrink-0 whitespace-nowrap
                    transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    active:scale-90 font-semibold
                    ${selectedCategory === i ? `bg-black text-white cursor-default`
                         : `bg-[#E4E2E2] text-gray-800 cursor-pointer`}`}
                    onClick={() => { setSelectedCategory(i)}}
                >{category.name}</p>
            ))}
        </div>
    )
}