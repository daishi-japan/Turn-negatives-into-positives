import { Header } from "@/components/header";
import { ConversionResult } from "@/components/conversion-result";

export const dynamic = "force-dynamic";

export default function ResultPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-[480px] mx-auto bg-white border-x-2 border-black">
      <Header />
      <ConversionResult />
    </div>
  );
}
