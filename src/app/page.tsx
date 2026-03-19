import { getAllArticles } from "@/lib/articles-server";
import { siteConfig } from "@/lib/config";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { ClientHomePage } from "@/components/ClientHomePage";

export default function HomePage() {
  const allArticles = getAllArticles();

  return (
    <>
      {/* JSON-LD Schema */}
      <WebsiteSchema />
      
      {/* Client-side interactive homepage */}
      <ClientHomePage articles={allArticles} />
    </>
  );
}
