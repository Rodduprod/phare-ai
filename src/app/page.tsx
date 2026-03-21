import { getArticleGroups } from "@/lib/articles-server";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { ClientHomePage } from "@/components/ClientHomePage";

export default function HomePage() {
  const groups = getArticleGroups();

  return (
    <>
      <WebsiteSchema />
      <ClientHomePage groups={groups} />
    </>
  );
}
