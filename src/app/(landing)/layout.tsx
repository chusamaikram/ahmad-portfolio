import Footer from "@/src/components/shared/footer";
import Header from "@/src/components/shared/header";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    )
}
