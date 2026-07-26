type Product = {
    id:            number
    category_id:   number
    category_name: string
    name:          string
    unit:          string
    image_url:     string
    min_volume:    number
    min_price:     number
    min_calories:  number
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="w-60 min-h-75 bg-[#E4E2E2] rounded-3xl flex flex-col">
            <div className="relative flex justify-center shrink-0">
                <div className="absolute bottom-7 ml-16 w-35 h-6 bg-black/35 rounded-full blur-sm" />
                <img src={product.image_url} className="relative z-10 scale-90" />
            </div>
            <div className="flex flex-row items-end min-h-[70px] mt-auto mb-5">
                <div className="flex flex-col justify-end flex-1/3 gap-2 ml-[14px]">
                    <p className="font-semibold text-[#4E4E4E] text-[22px] leading-5">{product.name}</p>
                    <p className="font-medium text-[#727171] text-sm -mt-1">{product.min_volume} {product.unit} • {product.min_calories} ккал</p>
                </div>
                <p className="flex-1 text-[32px] text-right mr-[14px] text-[#4E4E4E] font-semibold">{product.min_price}₽</p>
            </div>
        </div>
    )
}