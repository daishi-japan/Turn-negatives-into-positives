import { Header } from "@/components/header";
import { ConversionForm } from "@/components/conversion-form";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col max-w-[420px] mx-auto bg-[#fafafa] border-x-[3px] border-[#0a0a0a] shadow-[8px_8px_0_#0a0a0a] relative">
      <Header />
      <ConversionForm />
    </div>
  );
}
