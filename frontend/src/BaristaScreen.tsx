import KioskFrame from "./KioskFrame"
import { Toaster } from 'sonner'
import { toast } from 'sonner'

export default function BaristaScreen() {
    return (
        <KioskFrame>
            <Toaster
                position="top-center"
                style={{ fontFamily: "MyFont, sans-serif" }}
            />
            <div>Привет</div>
        </KioskFrame>
    )
}