import { Header } from "@/components/header";
import { ConversionResult } from "@/components/conversion-result";

export const dynamic = "force-dynamic";

export default function ResultPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-[420px] mx-auto bg-[#fafafa] border-x-[3px] border-[#0a0a0a] shadow-[8px_8px_0_#0a0a0a] relative">
      <Header />
      <ConversionResult />
    </div>
  );
}
