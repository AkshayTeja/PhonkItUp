import { Suspense } from "react";
import VaultPage from "../../components/vault-page"; // Adjust the path based on your project structure

export default function VaultPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-gray-400">Loading songs...</div>
      }
    >
      <VaultPage />
    </Suspense>
  );
}
