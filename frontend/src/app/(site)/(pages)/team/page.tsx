import Team from "@/components/Team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | NextCommerce",
  description: "Meet our awesome team",
};

const TeamPage = () => {
  return (
    <main>
      <Team />
    </main>
  );
};

export default TeamPage;
