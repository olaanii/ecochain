import { BridgeNavbar } from "@/components/layout/bridge-navbar";
import { Footer } from "@/components/layout/footer";
import InitiaBridgeInterface from "@/components/bridge-interface";

export default function BridgePage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white">
      <BridgeNavbar />
      <InitiaBridgeInterface />
      <Footer />
    </main>
  );
}
