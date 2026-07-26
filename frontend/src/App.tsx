import { useState, useEffect } from 'react'
import KioskFrame from './KioskFrame'
import CategoriesTabs from './components/CategoriesTabs'
import ProductCard from './components/ProductCard'
import { Toaster } from 'sonner'
import { toast } from 'sonner'

type ProductCardAndCategories = {
    id:            number
		category_id:   number
		name:          string
		category_name: string
		unit:          string
		image_url:     string
		min_volume:    number
		min_price:     number
		min_calories:  number
}

function App() {
  const [results, setResults] = useState<ProductCardAndCategories[]>([])

  const categories = Array.from(
    new Map(results.map(item => [item.category_id, item.category_name])).entries()
  ).map(([id, name]) => ({ id, name }))

  const GetProductsAndCategories = async() => {
    try {
      const response = await fetch("http://localhost:8080/api/get-products-and-categories")
      const data = await response.json()

      if (response.ok) {
        setResults(data["products"])
      } else {
        toast.error(data["error"])
      }
    } catch (err) {
      console.log("Ошибка сервера: ", err)
      toast.error("Ошибка сервера")
    }
  }

  useEffect(() => {
    GetProductsAndCategories()
  }, [])

  return (
    <KioskFrame>
      <Toaster
        position="bottom-center"
        style={{ fontFamily: "MyFont, sans-serif" }} />
      <div className='flex justify-center mt-4'>
        <p className='font-extrabold text-6xl'>PERKLY</p>
      </div>
      <CategoriesTabs categories={categories} />
      <div className="overflow-y-auto scrollbar-hide max-h-[980px] pb-[50px]"
      style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
        }}>
          {categories.map(category => (
              <div key={category.id}>
                  <p className="text-[40px] px-2 mt-6">{category.name}</p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                      {results
                          .filter(p => p.category_id === category.id)
                          .map(product => <ProductCard key={product.id} product={product} />)}
                  </div>
              </div>
          ))}
      </div>
    </KioskFrame>
  )

}

export default App
