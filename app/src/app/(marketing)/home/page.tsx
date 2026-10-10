import type { Metadata } from "next";
import LandingPage from "../page";

// Same landing page as /, but open to signed-in people too (linked from Profile → About Fargo).
// Not indexed, so search engines only list /.
export const metadata: Metadata = {
  title: "About Fargo · Every trip starts here",
  robots: { index: false },
};

export default LandingPage;
