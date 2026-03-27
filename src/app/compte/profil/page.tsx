import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ProfilClient } from "./ProfilClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil — Le Labo AI",
};

export default async function ProfilPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/compte/connexion");

  // Charger le profil utilisateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, created_at")
    .eq("id", user.id)
    .single();

  // Charger les articles sauvegardés
  const { data: savedArticles } = await supabase
    .from("saved_articles")
    .select("article_slug, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  return (
    <ProfilClient
      user={{ email: user.email!, id: user.id }}
      profile={profile ?? { level: "débutant", created_at: user.created_at }}
      savedArticles={savedArticles ?? []}
    />
  );
}
