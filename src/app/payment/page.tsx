import PremiumPage, { generateMetadata as premiumMetadata } from "../premium/page";

// /payment is a first-class alias of the Premium checkout, so shared pricing and
// payment logic stay in one place while payment links have a clear URL.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return premiumMetadata();
}

export default PremiumPage;
