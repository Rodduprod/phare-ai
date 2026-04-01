/**
 * Descriptions éditoriales pour les pages de tags.
 * Chaque entrée fournit un titre lisible et un paragraphe d'introduction SEO (~100-150 mots).
 * Resolves #69
 */

export interface TagMeta {
  title: string;
  description: string;
}

export const tagDescriptions: Record<string, TagMeta> = {
  'ia': {
    title: 'Intelligence Artificielle',
    description:
      "L'intelligence artificielle transforme notre quotidien à une vitesse inédite. Des assistants vocaux aux voitures autonomes, en passant par la médecine prédictive et les contenus générés automatiquement, l'IA s'invite dans tous les secteurs. Sur Le Labo AI, nous décryptons ces technologies pour tout le monde — que vous soyez débutant curieux ou professionnel en veille. Retrouvez ici nos articles sur les grands modèles de langage, la vision par ordinateur, l'automatisation et les enjeux éthiques de l'IA. Chaque sujet est traité en trois niveaux de lecture pour vous permettre d'apprendre à votre rythme.",
  },
  'iagenerative': {
    title: 'IA Générative',
    description:
      "L'IA générative désigne les systèmes capables de créer du contenu original : textes, images, musiques, vidéos ou lignes de code. Des modèles comme GPT-4, Claude, Gemini ou Midjourney illustrent cette révolution créative. Ces technologies soulèvent autant d'enthousiasme que de questions — sur la propriété intellectuelle, la désinformation ou l'impact sur les métiers créatifs. Le Labo AI vous guide à travers les dernières avancées de l'IA générative avec des explications accessibles et des exemples concrets, du grand débutant au développeur aguerri.",
  },
  'llm': {
    title: 'Grands Modèles de Langage (LLM)',
    description:
      "Les LLM (Large Language Models) sont au cœur de la révolution IA actuelle. Ces modèles entraînés sur des milliards de textes sont capables de comprendre et de générer du langage naturel avec une précision bluffante. GPT-4, Claude, Llama, Mistral, Gemini… la compétition mondiale entre laboratoires de recherche s'accélère. Sur Le Labo AI, nous comparons les modèles, expliquons les architectures et analysons les benchmarks — pour vous aider à comprendre quels LLM choisir et pourquoi, selon votre niveau de maîtrise technique.",
  },
  'chatgpt': {
    title: 'ChatGPT',
    description:
      "ChatGPT, développé par OpenAI, est l'assistant conversationnel IA le plus connu au monde. Depuis son lancement fin 2022, il a popularisé l'usage des LLM auprès du grand public et transformé des secteurs entiers : rédaction, programmation, enseignement, service client. Sur Le Labo AI, suivez les mises à jour de ChatGPT, découvrez ses nouveaux usages et apprenez à l'utiliser efficacement — que vous soyez un utilisateur occasionnel ou un professionnel cherchant à automatiser ses workflows.",
  },
  'outils': {
    title: 'Outils IA',
    description:
      "L'écosystème des outils IA s'enrichit chaque semaine de nouvelles applications : assistants de rédaction, générateurs d'images, outils no-code, agents autonomes... Il est difficile de s'y retrouver. Le Labo AI fait le tri pour vous en testant et comparant les solutions les plus utiles. Des outils gratuits aux plateformes professionnelles, découvrez comment intégrer l'IA dans votre quotidien ou votre entreprise, sans avoir besoin d'un bagage technique.",
  },
  'modèles': {
    title: 'Modèles IA',
    description:
      "Le monde des modèles IA évolue à une cadence folle : chaque mois apporte son lot de nouveaux modèles de langage, de vision ou multimodaux. GPT-4o, Claude 3.5, Gemini Ultra, Llama 3, Mistral Large… Ces modèles diffèrent par leur taille, leurs capacités, leur coût et leurs conditions d'utilisation. Le Labo AI analyse les sorties majeures, compare les performances et vous aide à choisir le bon modèle selon votre cas d'usage.",
  },
  'agentsia': {
    title: 'Agents IA',
    description:
      "Les agents IA représentent la prochaine frontière de l'intelligence artificielle : des systèmes capables de planifier, d'agir et d'apprendre de manière autonome pour accomplir des objectifs complexes. AutoGPT, Devin, Claude Computer Use… ces agents peuvent naviguer le web, écrire du code, envoyer des emails et interagir avec des logiciels sans intervention humaine. Le Labo AI vous explique comment fonctionnent ces agents, leurs limites actuelles et ce qu'ils changent concrètement dans le monde du travail.",
  },
  'openai': {
    title: 'OpenAI',
    description:
      "OpenAI est l'une des entreprises les plus influentes de l'ère IA. Créatrice de ChatGPT, GPT-4, DALL-E et Sora, elle a redéfini les standards de l'IA générative. Mais OpenAI, c'est aussi des controverses — sur sa gouvernance, ses relations avec Microsoft, et ses choix stratégiques entre mission non-profit et impératifs commerciaux. Le Labo AI suit de près l'actualité d'OpenAI : nouvelles sorties, partnerships, débats internes et impact sur l'écosystème IA mondial.",
  },
  'deepseek': {
    title: 'DeepSeek',
    description:
      "DeepSeek est le laboratoire IA chinois qui a secoué le monde tech début 2025 en publiant des modèles open-source aux performances comparables à GPT-4, pour une fraction du coût d'entraînement. Ses modèles DeepSeek-R1 et V3 ont relancé le débat sur l'efficacité computationnelle et la compétition sino-américaine en IA. Sur Le Labo AI, nous suivons l'évolution de DeepSeek et analysons ce que ses innovations signifient pour l'avenir de l'IA mondiale.",
  },
  'mistralai': {
    title: 'Mistral AI',
    description:
      "Mistral AI est la pépite française de l'intelligence artificielle. Fondée en 2023 par d'anciens chercheurs de Google DeepMind et Meta, la startup parisienne a rapidement fait ses preuves avec des modèles ouverts et performants comme Mistral 7B, Mixtral et Le Chat. Mistral incarne l'ambition européenne dans la course mondiale à l'IA. Le Labo AI couvre l'actualité de Mistral : nouveaux modèles, partenariats stratégiques et positionnement face aux géants américains.",
  },
  'computervision': {
    title: 'Vision par Ordinateur',
    description:
      "La vision par ordinateur permet aux machines d'analyser et de comprendre des images et des vidéos. Reconnaissance faciale, détection d'objets, voitures autonomes, imagerie médicale… ces applications transforment des industries entières. Avec l'essor des modèles multimodaux comme GPT-4o ou Gemini, la frontière entre texte et image s'efface. Le Labo AI vous explique les fondements et les dernières avancées de la vision par ordinateur, avec des exemples concrets adaptés à tous les niveaux.",
  },
  'nlp': {
    title: 'Traitement du Langage Naturel (NLP)',
    description:
      "Le NLP (Natural Language Processing) est la branche de l'IA qui s'intéresse à la compréhension et à la génération du langage humain. Traduction automatique, analyse de sentiments, résumé de texte, chatbots… le NLP est partout. Les transformers et les LLM modernes ont révolutionné ce domaine. Sur Le Labo AI, retrouvez des articles sur les techniques NLP, les modèles de référence et leurs applications pratiques.",
  },
  'infrastructure': {
    title: 'Infrastructure IA',
    description:
      "Derrière chaque grand modèle IA se cache une infrastructure colossale : clusters de GPU, datacenters optimisés, architectures distribuées et pipelines MLOps. La course à la puissance de calcul est devenue un enjeu géopolitique majeur, avec des investissements se chiffrant en dizaines de milliards. Le Labo AI analyse les tendances de l'infrastructure IA : des puces spécialisées aux stratégies cloud des hyperscalers, en passant par les enjeux énergétiques.",
  },
  'edgeai': {
    title: 'Edge AI',
    description:
      "L'Edge AI désigne l'exécution de modèles d'intelligence artificielle directement sur des appareils locaux — smartphones, objets connectés, capteurs industriels — sans recourir au cloud. Cette approche offre latence réduite, confidentialité renforcée et autonomie de fonctionnement. Avec la miniaturisation des modèles (quantization, distillation) et l'essor des puces dédiées, l'IA embarquée s'impose comme une tendance majeure. Le Labo AI explore les enjeux et les applications concrètes de l'Edge AI.",
  },
  'productivité': {
    title: 'Productivité & IA',
    description:
      "L'IA redéfinit notre rapport au travail et à la productivité. Des assistants de rédaction aux outils d'automatisation, en passant par les agents IA capables de gérer des tâches complexes, les gains de temps peuvent être spectaculaires. Mais savoir quels outils adopter, comment les intégrer dans ses workflows et éviter les pièges (hallucinations, dépendance) est crucial. Le Labo AI vous partage les meilleures pratiques pour booster votre productivité avec l'IA.",
  },
  'automatisation': {
    title: 'Automatisation IA',
    description:
      "L'automatisation par l'IA transforme les processus métiers à grande échelle : de la génération de rapports à la gestion des emails, en passant par le codage ou le service client. Des plateformes no-code comme Zapier ou Make intègrent désormais des agents IA, rendant l'automatisation accessible sans compétences techniques. Le Labo AI analyse les opportunités d'automatisation, leurs limites et leur impact sur l'emploi, pour vous aider à adapter votre façon de travailler.",
  },
  'securiteia': {
    title: 'Sécurité & IA',
    description:
      "L'essor de l'IA soulève des enjeux de sécurité majeurs : prompt injection, jailbreak de modèles, deepfakes, cyberattaques assistées par IA… Les organisations doivent repenser leurs défenses à l'ère des systèmes génératifs. En parallèle, l'IA est aussi un outil puissant pour la cybersécurité : détection d'anomalies, analyse de malwares, réponse aux incidents. Le Labo AI explore les deux faces de ce défi : les risques introduits par l'IA et les solutions qu'elle apporte.",
  },
  'deepfake': {
    title: 'Deepfakes',
    description:
      "Les deepfakes — vidéos, images ou sons synthétiques générés par IA — sont devenus indiscernables du réel pour l'œil non entraîné. Leur usage malveillant (désinformation, fraude, harcèlement) alarme gouvernements et plateformes. Mais la technologie sous-jacente, la synthèse d'image et la clone vocale, a aussi des applications légitimes en cinéma, éducation ou accessibilité. Le Labo AI vous aide à comprendre comment détecter les deepfakes et à suivre l'évolution réglementaire sur ce sujet.",
  },
  'trending': {
    title: 'Tendances IA',
    description:
      "L'actualité de l'intelligence artificielle ne s'arrête jamais : nouvelles annonces de modèles, levées de fonds records, polémiques éthiques, percées scientifiques… Il est difficile de tout suivre. La rubrique Tendances du Labo AI fait le point sur les sujets qui font l'actu en France et dans le monde — pour que vous ne ratiez aucune évolution majeure, sans vous noyer dans le flux d'informations.",
  },
  'actualité': {
    title: 'Actualité IA',
    description:
      "Chaque semaine apporte son lot de nouvelles dans le monde de l'intelligence artificielle. Lancements de modèles, partenariats stratégiques, régulations, controverses… Le Labo AI couvre l'actualité IA en français, avec un angle pédagogique : comprendre ce qui se passe, pourquoi c'est important et ce que ça change pour vous. Une veille essentielle pour tous ceux qui veulent rester informés sans être submergés.",
  },
  'innovation': {
    title: 'Innovation IA',
    description:
      "L'innovation en intelligence artificielle s'emballe : chaque mois, de nouvelles architectures, de nouveaux paradigmes d'entraînement et de nouveaux usages émergent des laboratoires de recherche. Du reinforcement learning aux agents multimodaux, en passant par le raisonnement symbolique ou la mémoire longue terme, Le Labo AI vous raconte les avancées qui comptent vraiment — et leur impact potentiel sur la société.",
  },
};
