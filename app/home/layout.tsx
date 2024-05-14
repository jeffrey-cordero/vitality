import Footer from "@/components/global/footer";
import Header from "@/components/global/header";

export default function Layout ({
   children
}: {
  children: React.ReactNode;
}) {
   return (
      <>
         <Header />
         {children}
         <Footer />
      </>
   );
}
