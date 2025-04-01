
import { GoogleDorker } from "@/components/GoogleDorker";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <GoogleDorker />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
