import { getArticleGroups } from "@/lib/articles-server";
import { getAllModules } from "@/lib/formation";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { ClientHomePage } from "@/components/ClientHomePage";

export default function HomePage() {
  const groups = getArticleGroups();
  const modules = getAllModules();

  return (
    <>
      <WebsiteSchema />
      <ClientHomePage groups={groups} modules={modules} />
    </>
  );
}
