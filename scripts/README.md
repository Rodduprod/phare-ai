# 🤖 AI Content Generator

Système automatisé de génération d'articles IA pour Le Labo AI.

## 🎯 Fonctionnalités

- **Scraping automatique** des actualités IA (HackerNews, Reddit, arXiv)
- **Génération intelligente** d'articles en 3 niveaux techniques
- **Publication automatique** via GitHub Actions
- **Rate limiting** pour éviter le spam (max 1 article/2h)

## 🔧 Configuration

### Variables d'environnement requises

```bash
ANTHROPIC_API_KEY=your_claude_api_key
GITHUB_TOKEN=automatically_provided_by_actions
```

### Niveaux techniques

- **🌱 Débutant** : Vulgarisation grand public (800-1000 mots)
- **🔧 Amateur** : Technique pour professionnels (1000-1200 mots)  
- **⚡ Confirmé** : Deep dive expert (1200-1500 mots)

## 🚀 Utilisation

### Génération manuelle

```bash
# Installation des dépendances
npm install

# Génération d'un article
npm run generate-content
```

### Automatisation (GitHub Actions)

Le workflow `ai-content-generator.yml` s'exécute :
- **Toutes les heures** à la minute 15
- **Manuellement** via GitHub Actions UI

## 📊 Sources d'actualités

1. **HackerNews** : Top stories filtrées par mots-clés IA
2. **Reddit /r/MachineLearning** : Posts trending  
3. **arXiv** : Derniers papers cs.AI
4. **Topics par défaut** : Si pas d'actualités trending

## 🛡️ Safeguards

- **Rate limiting** : 2h minimum entre articles
- **Détection doublons** : Évite les fichiers existants
- **Qualité** : Prompts spécialisés par niveau
- **Logs complets** : Traçabilité des générations

## 📁 Structure des fichiers

```
content/articles/
├── topic-debutant-2026-03-20.mdx
├── topic-amateur-2026-03-20.mdx  
└── topic-confirme-2026-03-20.mdx
```

## 🔄 Workflow automatique

1. **Scraping** → Récupération news IA
2. **Sélection** → Topic trending ou défaut
3. **Génération** → Article niveau aléatoire
4. **Validation** → Rate limiting + doublons
5. **Publication** → Commit + push automatique
6. **Déploiement** → Vercel redéploie le site

## 🎯 Résultat

**Le Labo AI devient la source française la plus réactive** avec du contenu IA fresh 24h/24 !