export type Category = { 
    id: number
    name: string
}

export type ProductCardAndCategories = {
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

export type PopUpProductInfo = {
    name:        string
    unit:        string
    description: string
    image_url:   string 
}

export type PopUpVariant = {
    id:            number
    volume:        number
    calories_base: number
    price_base:    number
}

export type PopUpOption = {
    id:             number
    group:          string
    name:           string
    volume:         number
    unit:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

export type Milk = {
    id:             number
    name:           string
    price_delta:    number
    calories_delta: number
    image_url:      string
}

export type CartItem = {
    productInfo: PopUpProductInfo
    variant: PopUpVariant
    milk: Milk | null
    options: PopUpOption[]
}