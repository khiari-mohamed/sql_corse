import { useState, useEffect, useRef, useCallback } from "react";
import { Home, BookOpen, Zap, Map, CreditCard, Brain, FileText, CheckCircle, Database, Lightbulb, Menu, Play, Copy, Check } from "lucide-react";

// ============================================================
// DATA LAYER - All course content from uploaded files
// ============================================================
const MOCK_DB = {
  etudiants: [
    { id: 1, nom: "Ben Ali", prenom: "Mariem", age: 20, ville: "Tunis" },
    { id: 2, nom: "Saidi", prenom: "Ahmed", age: 22, ville: "Sfax" },
    { id: 3, nom: "Trabelsi", prenom: "Rania", age: 21, ville: "Nabeul" },
    { id: 4, nom: "Ben Ahmed", prenom: "Houssem", age: 23, ville: "Sousse" },
  ],
  livres: [
    { id_livre: 1, titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupéry", genre: "Conte", prix: 12.5 },
    { id_livre: 2, titre: "1984", auteur: "George Orwell", genre: "Science-fiction", prix: 15.0 },
    { id_livre: 3, titre: "Les Misérables", auteur: "Victor Hugo", genre: "Classique", prix: 20.0 },
  ],
  ventes: [
    { id_vente: 1, date_vente: "2024-03-10", quantite: 5, id_livre: 1 },
    { id_vente: 2, date_vente: "2024-03-15", quantite: 2, id_livre: 2 },
    { id_vente: 3, date_vente: "2024-04-01", quantite: 3, id_livre: 1 },
    { id_vente: 4, date_vente: "2024-04-20", quantite: 1, id_livre: 3 },
  ],
};

const QUIZ_QUESTIONS = [
  { q: "Que signifie SQL ?", options: ["Structured Query Language","Simple Query Logic","System Query Level","Structured Question List"], correct: 0, explanation: "SQL = Structured Query Language — le langage standard pour gérer les bases de données." },
  { q: "Quelle requête permet d'afficher toutes les colonnes d'une table ?", options: ["SELECT ALL FROM table","SELECT * FROM table","SHOW TABLE","DISPLAY * FROM table"], correct: 1, explanation: "SELECT * FROM table affiche toutes les colonnes. L'astérisque (*) signifie « toutes les colonnes »." },
  { q: "Quelle commande ajoute un enregistrement dans une table ?", options: ["ADD INTO","INSERT INTO","UPDATE INTO","CREATE INTO"], correct: 1, explanation: "INSERT INTO table (colonnes) VALUES (valeurs) — c'est la syntaxe pour insérer." },
  { q: "Que se passe-t-il si on écrit DELETE FROM etudiants; sans WHERE ?", options: ["Supprime seulement le premier enregistrement","Ne fait rien","Supprime TOUS les enregistrements","Génère une erreur"], correct: 2, explanation: "DANGER ! Sans WHERE, DELETE FROM table supprime TOUTES les lignes. Toujours ajouter une condition !" },
  { q: "Quelle clause permet de filtrer les résultats ?", options: ["FILTER","HAVING","WHERE","LIMIT"], correct: 2, explanation: "WHERE condition — permet de filtrer : ex. WHERE ville = 'Tunis'" },
  { q: "Comment trier les livres par prix du plus cher au moins cher ?", options: ["ORDER BY prix ASC","SORT prix DESC","ORDER BY prix DESC","ARRANGE BY prix DESC"], correct: 2, explanation: "ORDER BY prix DESC — DESC = décroissant (du plus grand au plus petit)." },
  { q: "Que représente AUTO_INCREMENT ?", options: ["Incrémente automatiquement l'ID à chaque insertion","Crée automatiquement une table","Ajoute automatiquement des données","Trie automatiquement les données"], correct: 0, explanation: "AUTO_INCREMENT génère automatiquement une valeur numérique unique pour chaque nouvel enregistrement." },
  { q: "Quelle est la commande pour modifier une colonne existante ?", options: ["MODIFY TABLE","CHANGE TABLE","ALTER TABLE","UPDATE TABLE"], correct: 2, explanation: "ALTER TABLE nom_table ADD/DROP/MODIFY colonne — pour modifier la structure d'une table." },
  { q: "Qu'est-ce qu'une clé étrangère (FOREIGN KEY) ?", options: ["La clé principale d'une table","Une clé qui référence la clé primaire d'une autre table","Un mot de passe pour la table","Un index de performance"], correct: 1, explanation: "Une FOREIGN KEY crée un lien entre deux tables, référençant la PRIMARY KEY d'une autre table." },
  { q: "Quelle requête affiche les ventes avec le titre du livre correspondant ?", options: ["SELECT * FROM ventes, livres","SELECT * FROM ventes WHERE id = livres.id","SELECT ventes.*, livres.titre FROM ventes JOIN livres ON ventes.id_livre = livres.id_livre","SELECT ALL FROM ventes JOIN livres"], correct: 2, explanation: "JOIN combine deux tables. ON précise la condition de jointure entre les clés étrangères." },
  { q: "Comment supprimer définitivement une table ?", options: ["DELETE TABLE","REMOVE TABLE","DROP TABLE","CLEAR TABLE"], correct: 2, explanation: "DROP TABLE nom_table — supprime définitivement la table ET ses données. Irréversible !" },
  { q: "Quel type de données utiliser pour un texte de longueur variable ?", options: ["INT","DATE","VARCHAR","DECIMAL"], correct: 2, explanation: "VARCHAR(n) — chaîne de caractères de longueur variable jusqu'à n caractères." },
  { q: "Dans phpMyAdmin, où écrit-on les requêtes SQL ?", options: ["Onglet Structure","Onglet SQL","Onglet Insérer","Onglet Parcourir"], correct: 1, explanation: "L'onglet SQL dans phpMyAdmin permet d'écrire et d'exécuter des requêtes directement." },
  { q: "Comment modifier la ville de Saidi Ahmed en 'Tunis' ?", options: ["CHANGE etudiants SET ville='Tunis' WHERE nom='Saidi'","UPDATE etudiants SET ville='Tunis' WHERE nom='Saidi' AND prenom='Ahmed'","MODIFY etudiants ville='Tunis' WHERE nom='Saidi'","INSERT etudiants (ville) VALUES ('Tunis')"], correct: 1, explanation: "UPDATE table SET colonne=valeur WHERE condition — modifier des données existantes." },
  { q: "Quel type utiliser pour un prix comme 12.50 ?", options: ["INT","VARCHAR","DATE","DECIMAL(5,2)"], correct: 3, explanation: "DECIMAL(5,2) = nombre avec 5 chiffres au total et 2 après la virgule. Parfait pour les prix." },
];

const EXAM_QUESTIONS = {
  theory: [
    { q: "Qu'est-ce qu'une base de données ?", answer: "Une base de données est un ensemble organisé d'informations stockées de façon structurée, accessible et modifiable via un système de gestion (ex: MySQL)." },
    { q: "Quelle est la différence entre PRIMARY KEY et FOREIGN KEY ?", answer: "PRIMARY KEY : identifiant unique de chaque ligne dans une table. FOREIGN KEY : référence vers la PRIMARY KEY d'une autre table pour créer un lien entre tables." },
    { q: "Pourquoi utiliser WHERE dans UPDATE et DELETE ?", answer: "Sans WHERE, UPDATE modifie TOUTES les lignes et DELETE supprime TOUT. WHERE permet de cibler uniquement les enregistrements concernés." },
    { q: "Qu'est-ce que phpMyAdmin ?", answer: "phpMyAdmin est une interface graphique web qui permet de gérer des bases de données MySQL sans écrire de code — via des clics et des formulaires." },
  ],
  practical: [
    { q: "Créez la base de données 'librairie'", answer: "CREATE DATABASE librairie;" },
    { q: "Créez la table 'livres' avec les champs : id_livre (INT, PK, AUTO_INCREMENT), titre (VARCHAR 100, NOT NULL), auteur (VARCHAR 50, NOT NULL), genre (VARCHAR 30), prix (DECIMAL 5,2, NOT NULL)", answer: "CREATE TABLE livres (\n  id_livre INT AUTO_INCREMENT PRIMARY KEY,\n  titre VARCHAR(100) NOT NULL,\n  auteur VARCHAR(50) NOT NULL,\n  genre VARCHAR(30),\n  prix DECIMAL(5,2) NOT NULL\n);" },
    { q: "Insérez le livre : titre='Le Petit Prince', auteur='Antoine de Saint-Exupéry', genre='Conte', prix=12.50", answer: "INSERT INTO livres (titre, auteur, genre, prix)\nVALUES ('Le Petit Prince', 'Antoine de Saint-Exupéry', 'Conte', 12.50);" },
    { q: "Affichez tous les livres triés par prix décroissant", answer: "SELECT * FROM livres ORDER BY prix DESC;" },
    { q: "Affichez les ventes avec la date, la quantité et le titre du livre (JOIN)", answer: "SELECT ventes.date_vente, ventes.quantite, livres.titre\nFROM ventes\nJOIN livres ON ventes.id_livre = livres.id_livre;" },
    { q: "Modifiez le prix de '1984' à 18.00", answer: "UPDATE livres SET prix = 18.00 WHERE titre = '1984';" },
  ],
};

// ============================================================
// SIMPLE SQL ENGINE
// ============================================================
function runSQL(query, db) {
  const q = query.trim().replace(/\s+/g, " ");
  const upper = q.toUpperCase();

  // SELECT *
  if (/^SELECT \* FROM (\w+);?$/.test(q)) {
    const table = q.match(/FROM (\w+)/i)[1].toLowerCase();
    if (!db[table]) return { error: `Table '${table}' introuvable.` };
    return { rows: db[table], message: `${db[table].length} ligne(s) retournée(s)` };
  }
  // SELECT cols FROM table
  if (/^SELECT .+ FROM (\w+);?$/.test(q) && !/WHERE|JOIN|ORDER/i.test(q)) {
    const table = q.match(/FROM (\w+)/i)[1].toLowerCase();
    if (!db[table]) return { error: `Table '${table}' introuvable.` };
    const colsPart = q.match(/SELECT (.+) FROM/i)[1];
    const cols = colsPart.split(",").map(c => c.trim());
    const rows = db[table].map(r => {
      const obj = {};
      cols.forEach(c => { if (r[c] !== undefined) obj[c] = r[c]; });
      return obj;
    });
    return { rows, message: `${rows.length} ligne(s) retournée(s)` };
  }
  // SELECT * FROM table WHERE col = val
  if (/^SELECT \* FROM (\w+) WHERE (.+);?$/i.test(q) && !/ORDER BY/i.test(q)) {
    const [, table, cond] = q.match(/FROM (\w+) WHERE (.+?)(?:;)?$/i);
    const tbl = table.toLowerCase();
    if (!db[tbl]) return { error: `Table '${tbl}' introuvable.` };
    // Parse simple condition
    const match = cond.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*['"]?([^'"]+)['"]?/);
    if (!match) return { error: "Condition WHERE invalide." };
    const [, col, op, val] = match;
    const numVal = parseFloat(val);
    const rows = db[tbl].filter(r => {
      const v = r[col];
      if (v === undefined) return false;
      const compareTo = isNaN(numVal) ? val.replace(/['"]/g, "") : numVal;
      if (op === "=") return String(v).toLowerCase() === String(compareTo).toLowerCase();
      if (op === ">") return v > compareTo;
      if (op === "<") return v < compareTo;
      if (op === ">=") return v >= compareTo;
      if (op === "<=") return v <= compareTo;
      if (op === "!=") return v != compareTo;
    });
    return { rows, message: `${rows.length} ligne(s) retournée(s)` };
  }
  // ORDER BY
  if (/ORDER BY/i.test(q)) {
    const tableM = q.match(/FROM (\w+)/i);
    if (!tableM) return { error: "Syntaxe invalide." };
    const tbl = tableM[1].toLowerCase();
    if (!db[tbl]) return { error: `Table '${tbl}' introuvable.` };
    const orderM = q.match(/ORDER BY (\w+)(?:\s+(ASC|DESC))?/i);
    if (!orderM) return { error: "ORDER BY invalide." };
    const [, col, dir = "ASC"] = orderM;
    let rows = [...db[tbl]];
    rows.sort((a, b) => {
      if (a[col] < b[col]) return dir.toUpperCase() === "ASC" ? -1 : 1;
      if (a[col] > b[col]) return dir.toUpperCase() === "ASC" ? 1 : -1;
      return 0;
    });
    return { rows, message: `${rows.length} ligne(s) — triées par ${col} ${dir}` };
  }
  // JOIN
  if (/JOIN/i.test(q)) {
    // Simulate the ventes JOIN livres query
    const rows = MOCK_DB.ventes.map(v => {
      const livre = MOCK_DB.livres.find(l => l.id_livre === v.id_livre);
      return { date_vente: v.date_vente, quantite: v.quantite, titre: livre?.titre || "?" };
    });
    return { rows, message: `${rows.length} ligne(s) — résultat de la jointure` };
  }
  // INSERT
  if (/^INSERT INTO/i.test(q)) {
    return { success: "✅ Insertion réussie ! (simulation — les données ne sont pas réellement modifiées)", message: "1 ligne ajoutée" };
  }
  // UPDATE
  if (/^UPDATE/i.test(q)) {
    return { success: "✅ Mise à jour réussie ! (simulation)", message: "1 ligne modifiée" };
  }
  // DELETE
  if (/^DELETE FROM/i.test(q)) {
    const noWhere = !/WHERE/i.test(q);
    if (noWhere) return { warning: "⚠️ DANGER : DELETE sans WHERE supprime TOUTES les lignes ! (simulation bloquée)", message: "0 ligne supprimée" };
    return { success: "✅ Suppression réussie ! (simulation)", message: "1 ligne supprimée" };
  }
  // CREATE
  if (/^CREATE/i.test(q)) {
    return { success: "✅ Création réussie ! (simulation)", message: "Table/Base créée" };
  }
  // ALTER
  if (/^ALTER/i.test(q)) {
    return { success: "✅ Table modifiée ! (simulation)", message: "Structure mise à jour" };
  }
  // DROP
  if (/^DROP/i.test(q)) {
    return { warning: "⚠️ DROP est irréversible ! En simulation, rien n'est supprimé.", message: "Simulation uniquement" };
  }
  return { error: "Requête non reconnue. Essayez les exemples ci-dessous." };
}

// ============================================================
// UI COMPONENTS
// ============================================================
function SqlBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-emerald-500/30 my-3">
      {label && (
        <div className="bg-gray-800 px-4 py-1.5 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-mono font-bold">{label}</span>
          <button onClick={copy} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors px-2 py-0.5 rounded border border-gray-600 hover:border-emerald-400 flex items-center gap-1">
            {copied ? <><Check className="w-3 h-3" /> Copié!</> : "Copier"}
          </button>
        </div>
      )}
      <pre className="bg-gray-900 p-4 text-sm font-mono overflow-x-auto text-emerald-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Badge({ children, color = "emerald" }) {
  const colors = { emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", red: "bg-red-500/20 text-red-300 border-red-500/40", amber: "bg-amber-500/20 text-amber-300 border-amber-500/40", blue: "bg-blue-500/20 text-blue-300 border-blue-500/40", purple: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
  return <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${colors[color]}`}>{children}</span>;
}

function Card({ children, className = "", glow = false }) {
  return (
    <div className={`rounded-2xl border border-gray-700/60 bg-gray-800/50 backdrop-blur-sm p-5 ${glow ? "shadow-lg shadow-emerald-500/10" : ""} ${className}`}>
      {children}
    </div>
  );
}

function DataTable({ rows }) {
  if (!rows || rows.length === 0) return <p className="text-gray-400 text-sm italic">Aucun résultat.</p>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="bg-gray-900">
            {cols.map(c => <th key={c} className="px-4 py-2 text-left text-emerald-400 font-bold border-b border-gray-700">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-800/30" : "bg-gray-800/10"}>
              {cols.map(c => <td key={c} className="px-4 py-2 text-gray-200 border-b border-gray-800">{String(r[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="text-gray-400 ml-12">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

// PAGE 1: HERO
function HeroPage({ setPage }) {
  const cards = [
    { icon: BookOpen, label: "Cours Complet", page: "course", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
    { icon: Zap, label: "Playground SQL", page: "playground", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
    { icon: Map, label: "Schéma BDD", page: "erd", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30" },
    { icon: CreditCard, label: "Mémo Rapide", page: "cheatsheet", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
    { icon: Brain, label: "Quiz", page: "quiz", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
    { icon: FileText, label: "Examen Final", page: "exam", color: "from-red-500/20 to-orange-500/20", border: "border-red-500/30" },
  ];
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-bold mb-6">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Examen demain — gl tota 💪
        </div>
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          SQL &amp; Bases de Données
          <span className="block text-emerald-400">Prépare ton examen</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Tout le cours en un seul endroit. Simplifié, visuel, avec des exemples pratiques et un playground interactif.
        </p>
        {/* Animated terminal preview */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 text-left max-w-lg mx-auto mb-10 font-mono text-sm">
          <div className="flex gap-1.5 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
          <p className="text-gray-500">mysql&gt; <span className="text-emerald-400">SELECT * FROM etudiants WHERE ville = 'Tunis';</span></p>
          <div className="mt-2 text-xs text-gray-400">
            <p>+----+---------+--------+-----+-------+</p>
            <p>| id | nom     | prenom | age | ville |</p>
            <p>+----+---------+--------+-----+-------+</p>
            <p>|  1 | Boughanmi | bascota |  23 | Tunis |</p>
            <p>+----+---------+--------+-----+-------+</p>
            <p className="text-emerald-400">1 row in set (0.00 sec)</p>
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 pb-12">
        {cards.map(c => (
          <button key={c.page} onClick={() => setPage(c.page)}
            className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} p-5 text-left hover:scale-105 transition-all duration-200 group`}>
            <c.icon className="w-8 h-8 mb-2 text-white" />
            <div className="font-bold text-white text-sm group-hover:text-white">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mx-4 mb-8 rounded-2xl border border-gray-700 bg-gray-800/30 p-4 grid grid-cols-3 divide-x divide-gray-700 text-center">
        <div><p className="text-2xl font-black text-emerald-400">7</p><p className="text-xs text-gray-400">Commandes SQL</p></div>
        <div><p className="text-2xl font-black text-blue-400">15</p><p className="text-xs text-gray-400">Questions Quiz</p></div>
        <div><p className="text-2xl font-black text-purple-400">2 BDD</p><p className="text-xs text-gray-400">Bases pratiques</p></div>
      </div>
    </div>
  );
}

// PAGE 2: COURSE
function CoursePage() {
  const [active, setActive] = useState(0);
  const topics = [
    {
      icon: Database, title: "C'est quoi SQL ?",
      content: () => (
        <div>
          <p className="text-gray-300 mb-4 text-base leading-relaxed">SQL (<strong className="text-emerald-400">Structured Query Language</strong>) est un langage pour <strong className="text-white">communiquer avec une base de données</strong>. C'est comme parler une langue que comprend la base de données.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              ["Créer", "Des tables, des bases", "CREATE", "🔨"],
              ["Lire", "Des données stockées", "SELECT", "📖"],
              ["Modifier", "Des données existantes", "UPDATE", "✏️"],
              ["Supprimer", "Des données ou tables", "DELETE", "🗑️"]
            ].map(([title, desc, cmd, emoji]) => (
              <Card key={cmd} className="flex items-start gap-3">
                <span className="text-2xl">{emoji}</span>
                <div><p className="font-bold text-white text-sm">{title}</p><p className="text-gray-300 text-xs mb-1">{desc}</p><Badge>{cmd}</Badge></div>
              </Card>
            ))}
          </div>
          <Card className="border-blue-500/30 bg-blue-500/5">
            <p className="text-blue-300 text-sm font-bold">🔵 phpMyAdmin</p>
            <p className="text-gray-300 text-sm mt-1">Interface <strong className="text-white">graphique web</strong> pour gérer MySQL. L'onglet <strong className="text-emerald-400">SQL</strong> permet d'exécuter des requêtes.</p>
          </Card>
        </div>
      )
    },
    {
      icon: Database, title: "Créer une Base de Données",
      content: () => (
        <div>
          <p className="text-gray-300 mb-4">Dans phpMyAdmin, cliquez sur <strong className="text-emerald-400">"Nouvelle base de données"</strong> et nommez-la.</p>
          <SqlBlock code={`CREATE DATABASE gestion_etudiants;
CREATE DATABASE librairie;`} label="SQL - Créer une base" />
          <Card className="border-amber-500/30 bg-amber-500/5 mt-4">
            <p className="text-amber-300 text-sm">💡 <strong>Conseil :</strong> Nommez la base avec des underscores, sans espaces ni accents : <code className="text-white">gestion_etudiants</code></p>
          </Card>
        </div>
      )
    },
    {
      icon: FileText, title: "Créer une Table",
      content: () => (
        <div>
          <p className="text-gray-300 mb-4">Une table = un tableau avec des colonnes et des lignes. Chaque colonne a un <strong className="text-white">type de données</strong>.</p>
          <SqlBlock code={`CREATE TABLE etudiants (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nom     VARCHAR(50),
  prenom  VARCHAR(50),
  age     INT,
  ville   VARCHAR(50)
);`} label="Table : etudiants" />
          <SqlBlock code={`CREATE TABLE livres (
  id_livre INT AUTO_INCREMENT PRIMARY KEY,
  titre    VARCHAR(100) NOT NULL,
  auteur   VARCHAR(50)  NOT NULL,
  genre    VARCHAR(30),
  prix     DECIMAL(5,2) NOT NULL
);`} label="Table : livres" />
          <div className="overflow-x-auto rounded-xl border border-gray-700 mt-4">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-900"><th className="px-4 py-2 text-left text-emerald-400">Type</th><th className="px-4 py-2 text-left text-gray-300">Description</th><th className="px-4 py-2 text-left text-gray-400">Exemple</th></tr></thead>
              <tbody>
                {[["INT","Nombre entier","11, 3, 50"],["VARCHAR(n)","Texte variable","'Tunis', 'Ahmed'"],["DECIMAL(5,2)","Nombre décimal","12.50, 19.99"],["DATE","Date","'2024-03-10'"]].map(([t,d,e]) => (
                  <tr key={t} className="border-t border-gray-800">
                    <td className="px-4 py-2 font-mono text-emerald-300 font-bold">{t}</td>
                    <td className="px-4 py-2 text-gray-300">{d}</td>
                    <td className="px-4 py-2 text-gray-400 font-mono text-xs">{e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      icon: CheckCircle, title: "Clé Primaire & Auto-Increment",
      content: () => (
        <div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Card glow className="border-emerald-500/40">
              <p className="text-emerald-400 font-black text-sm mb-1">🔑 PRIMARY KEY</p>
              <p className="text-gray-300 text-sm">Identifiant <strong className="text-white">unique</strong> pour chaque ligne. Pas de doublon, pas de NULL.</p>
              <p className="mt-2 font-mono text-xs text-emerald-300">id INT PRIMARY KEY</p>
            </Card>
            <Card className="border-blue-500/40">
              <p className="text-blue-400 font-black text-sm mb-1">⬆️ AUTO_INCREMENT</p>
              <p className="text-gray-300 text-sm">MySQL génère automatiquement 1, 2, 3... à chaque insertion.</p>
              <p className="mt-2 font-mono text-xs text-blue-300">id INT AUTO_INCREMENT PRIMARY KEY</p>
            </Card>
          </div>
          <SqlBlock code={`-- Exemple : id s'incrémente automatiquement
INSERT INTO etudiants (nom, prenom, age, ville)
VALUES ('Ben Ali', 'Mariem', 20, 'Tunis');
-- id = 1 (automatique)

INSERT INTO etudiants (nom, prenom, age, ville)
VALUES ('Saidi', 'Ahmed', 22, 'Sfax');
-- id = 2 (automatique)`} label="AUTO_INCREMENT en action" />
        </div>
      )
    },
    {
      icon: Zap, title: "Clé Étrangère (FOREIGN KEY)",
      content: () => (
        <div>
          <p className="text-gray-300 mb-4">Une FOREIGN KEY crée un <strong className="text-white">lien entre deux tables</strong>. Elle référence la clé primaire d'une autre table.</p>
          <SqlBlock code={`CREATE TABLE ventes (
  id_vente   INT AUTO_INCREMENT PRIMARY KEY,
  date_vente DATE NOT NULL,
  quantite   INT NOT NULL,
  id_livre   INT,
  FOREIGN KEY (id_livre) REFERENCES livres(id_livre)
  -- id_livre dans ventes → id_livre dans livres
);`} label="FOREIGN KEY - Table ventes" />
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="bg-gray-900 rounded-xl border border-purple-500/40 p-3 text-center">
              <p className="text-purple-400 font-bold text-xs mb-1">livres</p>
              <p className="text-white font-mono text-sm">🔑 id_livre</p>
            </div>
            <div className="text-emerald-400 text-2xl font-bold">→</div>
            <div className="bg-gray-900 rounded-xl border border-emerald-500/40 p-3 text-center">
              <p className="text-emerald-400 font-bold text-xs mb-1">ventes</p>
              <p className="text-white font-mono text-sm">🔗 id_livre</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: Database, title: "SELECT — Lire les données",
      content: () => (
        <div>
          <SqlBlock code={`SELECT colonnes
FROM nom_table
WHERE condition;`} label="Syntaxe SELECT" />
          <div className="space-y-3 mt-2">
            {[
              ["Tous les étudiants", "SELECT * FROM etudiants;"],
              ["Seulement nom et prénom", "SELECT nom, prenom FROM etudiants;"],
              ["Étudiants de Tunis", "SELECT * FROM etudiants WHERE ville = 'Tunis';"],
              ["Étudiants > 20 ans", "SELECT * FROM etudiants WHERE age > 20;"],
              ["Livres triés par prix ↓", "SELECT * FROM livres ORDER BY prix DESC;"],
            ].map(([label, code]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <SqlBlock code={code} />
              </div>
            ))}
          </div>
          <Card className="border-blue-500/30 bg-blue-500/5 mt-4">
            <p className="text-blue-300 text-sm">💡 <code className="text-white">*</code> = toutes les colonnes | <code className="text-white">DESC</code> = décroissant | <code className="text-white">ASC</code> = croissant</p>
          </Card>
        </div>
      )
    },
    {
      icon: FileText, title: "INSERT — Ajouter des données",
      content: () => (
        <div>
          <SqlBlock code={`INSERT INTO nom_table (col1, col2, ...)
VALUES (val1, val2, ...);`} label="Syntaxe INSERT" />
          <SqlBlock code={`INSERT INTO etudiants (nom, prenom, age, ville)
VALUES ('Ben Ahmed', 'Houssem', 23, 'Sousse');

INSERT INTO livres (titre, auteur, genre, prix)
VALUES ('Le Petit Prince', 'Antoine de Saint-Exupéry', 'Conte', 12.50);`} label="Exemples INSERT" />
          <Card className="border-emerald-500/30 bg-emerald-500/5 mt-3">
            <p className="text-emerald-300 text-sm">✅ L'ordre des colonnes doit correspondre à l'ordre des valeurs.</p>
          </Card>
        </div>
      )
    },
    {
      icon: FileText, title: "UPDATE — Modifier des données",
      content: () => (
        <div>
          <SqlBlock code={`UPDATE nom_table
SET colonne = nouvelle_valeur
WHERE condition;`} label="Syntaxe UPDATE" />
          <SqlBlock code={`-- Modifier l'âge de Saidi
UPDATE etudiants SET age = 23 WHERE nom = 'Saidi';

-- Modifier ville de Saidi Ahmed
UPDATE etudiants
SET ville = 'Tunis'
WHERE nom = 'Saidi' AND prenom = 'Ahmed';

-- Modifier prix d'un livre
UPDATE livres SET prix = 18.00 WHERE titre = '1984';`} label="Exemples UPDATE" />
          <Card className="border-red-500/30 bg-red-500/5 mt-3">
            <p className="text-red-300 text-sm font-bold">⚠️ ATTENTION : Sans WHERE, TOUTES les lignes sont modifiées !</p>
            <SqlBlock code={`UPDATE etudiants SET ville = 'Tunis';
-- ← DANGER : modifie TOUS les étudiants !`} />
          </Card>
        </div>
      )
    },
    {
      icon: FileText, title: "DELETE — Supprimer des données",
      content: () => (
        <div>
          <SqlBlock code={`DELETE FROM nom_table
WHERE condition;`} label="Syntaxe DELETE" />
          <SqlBlock code={`-- Supprimer l'étudiant id = 3
DELETE FROM etudiants WHERE id = 3;`} label="Exemple DELETE" />
          <Card className="border-red-500/40 bg-red-500/10 mt-3">
            <p className="text-red-300 font-black text-sm mb-2">💀 COMMANDE DANGEREUSE</p>
            <SqlBlock code={`DELETE FROM etudiants;
-- ← SUPPRIME TOUT LE CONTENU ! IRRÉVERSIBLE !`} />
            <p className="text-red-200 text-sm mt-2">Toujours vérifier votre WHERE avant d'appuyer sur Exécuter !</p>
          </Card>
        </div>
      )
    },
    {
      icon: Database, title: "ALTER TABLE & DROP",
      content: () => (
        <div>
          <p className="text-gray-300 mb-3">ALTER TABLE modifie la <strong className="text-white">structure</strong> d'une table existante.</p>
          <SqlBlock code={`-- Ajouter une colonne email
ALTER TABLE etudiants ADD email VARCHAR(100);

-- Supprimer la colonne email
ALTER TABLE etudiants DROP COLUMN email;`} label="ALTER TABLE" />
          <Card className="border-red-500/40 bg-red-500/10 mt-4">
            <p className="text-red-300 font-black text-sm mb-2">💀 DROP — Suppression définitive</p>
            <SqlBlock code={`DROP TABLE etudiants;           -- Supprime la table
DROP DATABASE gestion_etudiants; -- Supprime la base`} />
            <p className="text-red-200 text-sm mt-2">Faire une <strong>sauvegarde (Export SQL)</strong> avant tout DROP !</p>
          </Card>
        </div>
      )
    },
    {
      icon: Zap, title: "JOIN — Jointure entre tables",
      content: () => (
        <div>
          <p className="text-gray-300 mb-4">JOIN combine des données de <strong className="text-white">plusieurs tables</strong> reliées par des clés.</p>
          <SqlBlock code={`SELECT ventes.date_vente, ventes.quantite, livres.titre
FROM ventes
JOIN livres ON ventes.id_livre = livres.id_livre;`} label="JOIN - Ventes avec titres de livres" />
          <div className="mt-4 p-3 rounded-xl bg-gray-900 border border-gray-700 text-xs font-mono">
            <p className="text-gray-400">Résultat :</p>
            <div className="mt-1">
              <DataTable rows={[
                { date_vente: "2024-03-10", quantite: 5, titre: "Le Petit Prince" },
                { date_vente: "2024-03-15", quantite: 2, titre: "1984" },
                { date_vente: "2024-04-01", quantite: 3, titre: "Le Petit Prince" },
                { date_vente: "2024-04-20", quantite: 1, titre: "Les Misérables" },
              ]} />
            </div>
          </div>
          <Card className="border-blue-500/30 bg-blue-500/5 mt-3">
            <p className="text-blue-300 text-sm">💡 <code className="text-white">ON ventes.id_livre = livres.id_livre</code> — la condition de jointure relie les deux tables via la clé étrangère.</p>
          </Card>
        </div>
      )
    },
    {
      icon: Database, title: "Export & Import",
      content: () => (
        <div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-emerald-500/30">
              <p className="text-emerald-400 font-black text-sm mb-2">📤 EXPORT (Sauvegarde)</p>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Cliquez sur la base</li>
                <li>Onglet <strong className="text-white">Exporter</strong></li>
                <li>Format : <strong className="text-white">SQL</strong></li>
                <li>Cliquez <strong className="text-white">Exécuter</strong></li>
              </ol>
              <p className="text-gray-400 text-xs mt-2">Crée un fichier .sql téléchargeable</p>
            </Card>
            <Card className="border-blue-500/30">
              <p className="text-blue-400 font-black text-sm mb-2">📥 IMPORT (Restauration)</p>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Créez une base vide</li>
                <li>Onglet <strong className="text-white">Importer</strong></li>
                <li><strong className="text-white">Choisir un fichier</strong> .sql</li>
                <li>Cliquez <strong className="text-white">Exécuter</strong></li>
              </ol>
              <p className="text-gray-400 text-xs mt-2">Restaure la base depuis le fichier</p>
            </Card>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SectionTitle icon={<BookOpen className="w-8 h-8" />} title="Cours Complet" subtitle="Tout le programme, simplifié et illustré" />
      <div className="flex gap-4">
        {/* Topic list */}
        <div className="w-48 flex-shrink-0 hidden md:block">
          <div className="sticky top-4 space-y-1">
            {topics.map((t, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${active === i ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}>
                <t.icon className="w-4 h-4" /><span className="font-medium">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Mobile topic selector */}
        <div className="md:hidden mb-4 w-full">
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm"
            value={active} onChange={e => setActive(Number(e.target.value))}>
            {topics.map((t, i) => <option key={i} value={i}>{t.title}</option>)}
          </select>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card glow>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-700">
              {(() => { const Icon = topics[active].icon; return <Icon className="w-8 h-8 text-emerald-400" />; })()}
              <h3 className="text-xl font-black text-white">{topics[active].title}</h3>
              <span className="ml-auto text-xs text-gray-500">{active + 1}/{topics.length}</span>
            </div>
            {topics[active].content()}
          </Card>
          <div className="flex justify-between mt-4">
            <button disabled={active === 0} onClick={() => setActive(a => a - 1)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm disabled:opacity-30 hover:bg-gray-600 transition-colors">
              ← Précédent
            </button>
            <button disabled={active === topics.length - 1} onClick={() => setActive(a => a + 1)}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-30 hover:bg-emerald-500 transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PAGE 3: SQL PLAYGROUND
function PlaygroundPage() {
  const [query, setQuery] = useState("SELECT * FROM etudiants;");
  const [result, setResult] = useState(null);
  const [db, setDb] = useState(MOCK_DB);
  const [selectedDb, setSelectedDb] = useState("gestion_etudiants");

  const activeDb = selectedDb === "gestion_etudiants"
    ? { etudiants: db.etudiants }
    : { livres: db.livres, ventes: db.ventes };

  const samples = [
    { label: "Tous les étudiants", q: "SELECT * FROM etudiants;" },
    { label: "Étudiants de Tunis", q: "SELECT * FROM etudiants WHERE ville = 'Tunis';" },
    { label: "Étudiants > 20 ans", q: "SELECT * FROM etudiants WHERE age > 20;" },
    { label: "Tous les livres", q: "SELECT * FROM livres;" },
    { label: "Livres par prix ↓", q: "SELECT * FROM livres ORDER BY prix DESC;" },
    { label: "Livres sci-fi", q: "SELECT * FROM livres WHERE genre = 'Science-fiction';" },
    { label: "Toutes les ventes", q: "SELECT * FROM ventes;" },
    { label: "Ventes > 2 ex.", q: "SELECT * FROM ventes WHERE quantite > 2;" },
    { label: "JOIN ventes+livres", q: "SELECT ventes.date_vente, ventes.quantite, livres.titre FROM ventes JOIN livres ON ventes.id_livre = livres.id_livre;" },
    { label: "Ajouter étudiant", q: "INSERT INTO etudiants (nom, prenom, age, ville)\nVALUES ('Mansouri', 'Sara', 19, 'Bizerte');" },
    { label: "Modifier âge", q: "UPDATE etudiants SET age = 25 WHERE nom = 'Saidi';" },
    { label: "Supprimer (sécurisé)", q: "DELETE FROM etudiants WHERE id = 3;" },
  ];

  const run = () => {
    const res = runSQL(query, { ...MOCK_DB });
    setResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SectionTitle icon="⚡" title="Playground SQL" subtitle="Testez vos requêtes sur de vraies données simulées" />

      {/* DB selector */}
      <div className="flex gap-2 mb-4">
        {["gestion_etudiants", "librairie"].map(d => (
          <button key={d} onClick={() => setSelectedDb(d)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedDb === d ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}>
            🗄️ {d}
          </button>
        ))}
      </div>

      {/* Database preview */}
      <div className="mb-4 grid md:grid-cols-2 gap-3">
        {Object.entries(activeDb).map(([name, rows]) => (
          <Card key={name} className="overflow-hidden p-0">
            <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-mono font-bold">📋 {name}</span>
              <span className="text-gray-500 text-xs ml-auto">{rows.length} lignes</span>
            </div>
            <div className="p-3 overflow-x-auto max-h-40">
              <DataTable rows={rows} />
            </div>
          </Card>
        ))}
      </div>

      {/* SQL Editor */}
      <Card glow className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="w-3 h-3 rounded-full bg-green-500"></span></div>
          <span className="text-gray-400 text-xs font-mono">mysql&gt; éditeur SQL</span>
        </div>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={4}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-emerald-300 font-mono text-sm resize-none focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="Écrivez votre requête SQL ici..."
          onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") run(); }}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-500 text-xs">Ctrl+Enter pour exécuter</p>
          <button onClick={run} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" /> Exécuter
          </button>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card className={`mb-4 ${result.error ? "border-red-500/40" : result.warning ? "border-amber-500/40" : "border-emerald-500/40"}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm font-bold ${result.error ? "text-red-400" : result.warning ? "text-amber-400" : "text-emerald-400"}`}>
              {result.error ? "❌ Erreur" : result.warning ? "⚠️ Attention" : "✅ Résultat"}
            </span>
            {result.message && <span className="text-gray-400 text-xs ml-auto">{result.message}</span>}
          </div>
          {result.error && <p className="text-red-300 text-sm font-mono">{result.error}</p>}
          {result.warning && <p className="text-amber-300 text-sm">{result.warning}</p>}
          {result.success && <p className="text-emerald-300 text-sm">{result.success}</p>}
          {result.rows && <DataTable rows={result.rows} />}
        </Card>
      )}

      {/* Sample queries */}
      <div>
        <p className="text-gray-400 text-sm font-bold mb-3">📎 Exemples rapides :</p>
        <div className="flex flex-wrap gap-2">
          {samples.map(s => (
            <button key={s.label} onClick={() => { setQuery(s.q); setResult(null); }}
              className="px-3 py-1.5 bg-gray-700/60 hover:bg-gray-600 text-gray-300 hover:text-white text-xs rounded-lg border border-gray-600 hover:border-gray-500 transition-all font-mono">
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// PAGE 4: ERD
function ErdPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SectionTitle icon="🗺️" title="Schéma de la Base de Données" subtitle="Relations entre les tables — Base librairie" />
      {/* Visual ERD */}
      <Card glow className="mb-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
          {/* livres table */}
          <div className="rounded-2xl border-2 border-purple-500/60 bg-purple-500/10 overflow-hidden w-64">
            <div className="bg-purple-500/30 px-4 py-2 text-center">
              <p className="text-purple-300 font-black">📚 livres</p>
            </div>
            <div className="p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-400">🔑</span><span className="text-white font-bold">id_livre</span><span className="text-gray-400">INT PK</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">titre</span><span className="text-gray-500">VARCHAR(100)</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">auteur</span><span className="text-gray-500">VARCHAR(50)</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">genre</span><span className="text-gray-500">VARCHAR(30)</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">prix</span><span className="text-gray-500">DECIMAL(5,2)</span></div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="hidden md:block h-0.5 w-16 bg-emerald-500"></div>
            <div className="md:hidden w-0.5 h-8 bg-emerald-500"></div>
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-3 py-1 text-xs text-center">
              <p className="text-emerald-400 font-bold">FOREIGN KEY</p>
              <p className="text-gray-400">ventes.id_livre</p>
              <p className="text-gray-400">→ livres.id_livre</p>
            </div>
            <div className="hidden md:block h-0.5 w-16 bg-emerald-500"></div>
            <div className="md:hidden w-0.5 h-8 bg-emerald-500"></div>
          </div>

          {/* ventes table */}
          <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/10 overflow-hidden w-64">
            <div className="bg-emerald-500/30 px-4 py-2 text-center">
              <p className="text-emerald-300 font-black">🛒 ventes</p>
            </div>
            <div className="p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center gap-2"><span className="text-amber-400">🔑</span><span className="text-white font-bold">id_vente</span><span className="text-gray-400">INT PK</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">date_vente</span><span className="text-gray-500">DATE</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-500">  </span><span className="text-gray-300">quantite</span><span className="text-gray-500">INT</span></div>
              <div className="flex items-center gap-2"><span className="text-blue-400">🔗</span><span className="text-blue-300 font-bold">id_livre</span><span className="text-gray-400">INT FK</span></div>
            </div>
          </div>
        </div>
      </Card>

      {/* etudiants table */}
      <Card className="mb-6">
        <h3 className="text-white font-black mb-4">📋 Base : gestion_etudiants</h3>
        <div className="rounded-2xl border-2 border-blue-500/60 bg-blue-500/10 overflow-hidden max-w-xs">
          <div className="bg-blue-500/30 px-4 py-2">
            <p className="text-blue-300 font-black text-center">👥 etudiants</p>
          </div>
          <div className="p-3 space-y-1 font-mono text-xs">
            {[["🔑","id","INT PK AUTO_INCREMENT","amber"],["  ","nom","VARCHAR(50)","gray"],["  ","prenom","VARCHAR(50)","gray"],["  ","age","INT","gray"],["  ","ville","VARCHAR(50)","gray"]].map(([ic,f,t,c]) => (
              <div key={f} className="flex items-center gap-2">
                <span className={`text-${c}-400`}>{ic}</span>
                <span className={`${c === "amber" ? "text-white font-bold" : "text-gray-300"}`}>{f}</span>
                <span className="text-gray-500">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Explanation */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <h3 className="text-blue-300 font-black mb-3">🧠 Comment lire ce schéma ?</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-bold text-white mb-1">🔑 PRIMARY KEY (PK)</p>
            <p>Identifiant unique de chaque ligne. Ex: <code className="text-amber-300">id_livre = 1</code></p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">🔗 FOREIGN KEY (FK)</p>
            <p>Référence vers une autre table. <code className="text-blue-300">ventes.id_livre</code> pointe vers <code className="text-purple-300">livres.id_livre</code></p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">→ Relation 1 à plusieurs</p>
            <p>1 livre peut avoir plusieurs ventes. C'est une relation <strong>1:N</strong>.</p>
          </div>
          <div>
            <p className="font-bold text-white mb-1">JOIN</p>
            <p>La FOREIGN KEY est ce qui permet d'utiliser JOIN pour combiner les tables.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// PAGE 5: CHEAT SHEET
function CheatsheetPage() {
  const [flip, setFlip] = useState({});
  const flashcards = [
    { front: "Afficher toutes les données", back: "SELECT * FROM table;" },
    { front: "Filtrer les résultats", back: "SELECT * FROM table\nWHERE condition;" },
    { front: "Ajouter une ligne", back: "INSERT INTO table (cols)\nVALUES (vals);" },
    { front: "Modifier une valeur", back: "UPDATE table\nSET col=val\nWHERE condition;" },
    { front: "Supprimer une ligne", back: "DELETE FROM table\nWHERE condition;" },
    { front: "Trier les résultats", back: "SELECT * FROM table\nORDER BY col DESC;" },
    { front: "Créer une table", back: "CREATE TABLE nom (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  col VARCHAR(50)\n);" },
    { front: "Modifier la structure", back: "ALTER TABLE nom\nADD col VARCHAR(100);" },
    { front: "Jointure entre tables", back: "SELECT a.col, b.col\nFROM a\nJOIN b ON a.fk = b.pk;" },
    { front: "Supprimer une table", back: "DROP TABLE nom; ⚠️" },
  ];

  const dangerCmds = [
    { cmd: "DELETE FROM table;", danger: "Supprime TOUTES les lignes" },
    { cmd: "UPDATE table SET x=y;", danger: "Modifie TOUTES les lignes" },
    { cmd: "DROP TABLE table;", danger: "Supprime la table entière" },
    { cmd: "DROP DATABASE db;", danger: "Supprime toute la base" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SectionTitle icon="🃏" title="Mémo Rapide" subtitle="Flashcards, antisèche et points clés pour l'examen" />

      {/* Cheat sheet */}
      <div className="mb-8">
        <h3 className="text-white font-black mb-4 text-lg">📋 Référence SQL Complète</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-4 py-3 text-left text-emerald-400 font-bold">Action</th>
                <th className="px-4 py-3 text-left text-blue-400 font-bold">Commande</th>
                <th className="px-4 py-3 text-left text-gray-400 font-bold">Exemple</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Créer une base","CREATE DATABASE","CREATE DATABASE librairie;"],
                ["Créer une table","CREATE TABLE","CREATE TABLE livres (id INT PRIMARY KEY, ...)"],
                ["Ajouter des données","INSERT INTO","INSERT INTO livres (titre, prix) VALUES ('1984', 15);"],
                ["Afficher des données","SELECT","SELECT * FROM livres;"],
                ["Filtrer","WHERE","SELECT * FROM livres WHERE prix > 10;"],
                ["Trier","ORDER BY","SELECT * FROM livres ORDER BY prix DESC;"],
                ["Modifier des données","UPDATE","UPDATE livres SET prix=18 WHERE id=2;"],
                ["Supprimer une ligne","DELETE","DELETE FROM livres WHERE id=2;"],
                ["Modifier la structure","ALTER TABLE","ALTER TABLE livres ADD stock INT;"],
                ["Supprimer une table","DROP TABLE","DROP TABLE livres; ⚠️"],
                ["Jointure","JOIN","SELECT * FROM ventes JOIN livres ON ventes.id_livre = livres.id_livre;"],
              ].map(([a,c,e]) => (
                <tr key={c} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2 text-gray-300">{a}</td>
                  <td className="px-4 py-2 font-mono text-emerald-300 font-bold">{c}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flashcards */}
      <div className="mb-8">
        <h3 className="text-white font-black mb-2 text-lg">🃏 Flashcards (clique pour voir la réponse)</h3>
        <p className="text-gray-400 text-sm mb-4">Clique sur chaque carte pour retourner la réponse.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {flashcards.map((c, i) => (
            <div key={i} onClick={() => setFlip(f => ({ ...f, [i]: !f[i] }))}
              className={`cursor-pointer rounded-xl border p-4 min-h-24 flex items-center justify-center text-center transition-all duration-300 ${flip[i] ? "bg-emerald-500/10 border-emerald-500/40" : "bg-gray-800/50 border-gray-700 hover:border-gray-500"}`}>
              {flip[i]
                ? <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap">{c.back}</pre>
                : <p className="text-gray-200 text-xs font-medium">{c.front}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h3 className="text-red-400 font-black mb-4 text-lg">⚠️ Commandes Dangereuses — À retenir !</h3>
        <div className="space-y-2">
          {dangerCmds.map(({ cmd, danger }) => (
            <div key={cmd} className="flex items-center gap-4 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
              <code className="font-mono text-red-300 text-sm flex-1">{cmd}</code>
              <span className="text-red-200 text-sm">{danger}</span>
            </div>
          ))}
        </div>
        <Card className="border-amber-500/30 bg-amber-500/5 mt-4">
          <p className="text-amber-300 font-bold text-sm mb-2">💡 Règle d'or :</p>
          <p className="text-gray-300 text-sm">Toujours utiliser <code className="text-white">WHERE</code> avec UPDATE et DELETE. Toujours faire un <strong className="text-white">EXPORT</strong> avant un DROP.</p>
        </Card>
      </div>
    </div>
  );
}

// PAGE 6: QUIZ
function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState([]);

  const q = QUIZ_QUESTIONS[current];
  const progress = ((current) / QUIZ_QUESTIONS.length) * 100;

  const answer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === q.correct;
    if (correct) setScore(s => s + 1);
    setResults(r => [...r, { correct, selected: i }]);
  };

  const next = () => {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setResults([]);
  };

  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card glow className="text-center py-10">
          <div className="text-6xl mb-4">{pct >= 70 ? "🎉" : pct >= 50 ? "💪" : "📚"}</div>
          <h2 className="text-3xl font-black text-white mb-2">Quiz Terminé !</h2>
          <p className="text-gray-400 mb-6">Voici tes résultats</p>
          <div className={`text-5xl font-black mb-2 ${pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {score}/{QUIZ_QUESTIONS.length}
          </div>
          <div className="text-lg text-gray-400 mb-6">{pct}%</div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}></div>
          </div>
          <p className="text-gray-300 mb-8">
            {pct >= 70 ? "Excellent ! Tu es bien préparé(e) pour l'examen 🚀" :
             pct >= 50 ? "Bien ! Revois les points manqués et tu seras prêt(e) !" :
             "Continue à étudier ! Relis le cours et réessaie."}
          </p>
          {/* Review */}
          <div className="text-left space-y-2 mb-6">
            {QUIZ_QUESTIONS.map((q, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${results[i]?.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                <span className="text-lg">{results[i]?.correct ? "✅" : "❌"}</span>
                <span className="text-gray-300 flex-1">{q.q}</span>
                {!results[i]?.correct && <span className="text-emerald-300 text-xs font-mono">→ {q.options[q.correct]}</span>}
              </div>
            ))}
          </div>
          <button onClick={reset} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            🔄 Recommencer
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <SectionTitle icon="🧠" title="Quiz SQL" subtitle="15 questions basées sur le cours" />
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {current + 1} / {QUIZ_QUESTIONS.length}</span>
          <span className="text-emerald-400 font-bold">Score: {score}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <Card glow>
        <p className="text-white font-bold text-lg mb-6 leading-snug">{q.q}</p>
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            let cls = "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500";
            if (answered) {
              if (i === q.correct) cls = "border-emerald-500 bg-emerald-500/20 text-white";
              else if (i === selected && i !== q.correct) cls = "border-red-500 bg-red-500/20 text-white";
              else cls = "border-gray-800 bg-gray-800/20 text-gray-500";
            }
            return (
              <button key={i} onClick={() => answer(i)} disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls}`}>
                <span className="font-bold text-gray-500 mr-3">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className={`rounded-xl p-4 mb-4 text-sm ${selected === q.correct ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-blue-500/10 border border-blue-500/30"}`}>
            <p className={`font-bold mb-1 ${selected === q.correct ? "text-emerald-400" : "text-blue-400"}`}>
              {selected === q.correct ? "✅ Correct !" : `❌ La bonne réponse est : ${q.options[q.correct]}`}
            </p>
            <p className="text-gray-300">{q.explanation}</p>
          </div>
        )}
        {answered && (
          <button onClick={next} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            {current + 1 >= QUIZ_QUESTIONS.length ? "Voir les résultats 🏁" : "Question suivante →"}
          </button>
        )}
      </Card>
    </div>
  );
}

// PAGE 7: EXAM
function ExamPage() {
  const [phase, setPhase] = useState("intro"); // intro | exam | submitted
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes
  const [answers, setAnswers] = useState({});
  const [showCorrections, setShowCorrections] = useState(false);
  const intervalRef = useRef(null);

  const startExam = () => {
    setPhase("exam");
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); setPhase("submitted"); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const submit = () => {
    clearInterval(intervalRef.current);
    setPhase("submitted");
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const timeColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-amber-400" : "text-emerald-400";

  if (phase === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SectionTitle icon="📝" title="Examen Final" subtitle="Simulation d'examen — Conditions réelles" />
        <Card glow className="text-center py-10">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-black text-white mb-3">Examen de Bases de Données</h3>
          <p className="text-gray-400 mb-6">Cours : SQL et phpMyAdmin • Mme. Sirine BEN AMMAR</p>
          <div className="grid grid-cols-3 gap-4 mb-8 mx-auto max-w-xs">
            <div className="text-center"><p className="text-2xl font-black text-blue-400">40</p><p className="text-xs text-gray-400">minutes</p></div>
            <div className="text-center"><p className="text-2xl font-black text-purple-400">2</p><p className="text-xs text-gray-400">parties</p></div>
            <div className="text-center"><p className="text-2xl font-black text-emerald-400">10</p><p className="text-xs text-gray-400">questions</p></div>
          </div>
          <div className="text-left bg-gray-900 rounded-xl p-4 mb-6 text-sm text-gray-300 space-y-1">
            <p>• <strong className="text-white">Partie 1</strong> — Théorie (4 questions)</p>
            <p>• <strong className="text-white">Partie 2</strong> — SQL pratique (6 exercices)</p>
            <p>• Les corrections sont disponibles après la soumission</p>
          </div>
          <button onClick={startExam} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg transition-all hover:scale-105">
            ▶ Commencer l'Examen
          </button>
        </Card>
      </div>
    );
  }

  if (phase === "submitted") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card glow className="text-center py-8 mb-6">
          <div className="mb-3"><CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" /></div>
          <h2 className="text-2xl font-black text-white mb-2">Examen Soumis !</h2>
          <p className="text-gray-400">Voici les corrections complètes</p>
        </Card>
        <div className="space-y-4">
          <h3 className="text-white font-black text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" /> Partie 1 — Théorie</h3>
          {EXAM_QUESTIONS.theory.map((q, i) => (
            <Card key={i} className="border-blue-500/30">
              <p className="text-gray-400 text-xs mb-1">Question {i + 1}</p>
              <p className="text-white font-bold mb-2">{q.q}</p>
              {answers[`t${i}`] && (
                <div className="bg-gray-900 rounded-lg p-3 mb-2 text-sm text-gray-300 border-l-2 border-blue-500">
                  <p className="text-blue-400 text-xs mb-1">Ta réponse :</p>
                  {answers[`t${i}`]}
                </div>
              )}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-gray-200">
                <p className="text-emerald-400 text-xs font-bold mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correction :</p>
                {q.answer}
              </div>
            </Card>
          ))}
          <h3 className="text-white font-black text-lg mt-6 flex items-center gap-2"><Zap className="w-5 h-5" /> Partie 2 — SQL Pratique</h3>
          {EXAM_QUESTIONS.practical.map((q, i) => (
            <Card key={i} className="border-purple-500/30">
              <p className="text-gray-400 text-xs mb-1">Exercice {i + 1}</p>
              <p className="text-white font-bold mb-2">{q.q}</p>
              {answers[`p${i}`] && (
                <div className="bg-gray-900 rounded-lg p-3 mb-2 font-mono text-sm text-emerald-300 border-l-2 border-blue-500">
                  <p className="text-blue-400 text-xs mb-1">Ta réponse :</p>
                  {answers[`p${i}`]}
                </div>
              )}
              <SqlBlock code={q.answer} label={<span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correction</span>} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Timer bar */}
      <div className={`sticky top-0 z-10 flex items-center justify-between bg-gray-900/95 backdrop-blur border-b border-gray-700 px-4 py-3 mb-6 -mx-4`}>
        <span className="text-white font-bold flex items-center gap-2"><FileText className="w-5 h-5" /> Examen — SQL & Base de Données</span>
        <div className={`font-mono text-xl font-black ${timeColor}`}>{mins}:{secs}</div>
      </div>

      <p className="text-gray-400 text-sm mb-6 italic">Répondez à toutes les questions. Les corrections seront disponibles après la soumission.</p>

      {/* Part 1: Theory */}
      <div className="mb-8">
        <h3 className="text-lg font-black text-white mb-4 pb-2 border-b border-gray-700">Partie 1 — Questions Théoriques</h3>
        <div className="space-y-4">
          {EXAM_QUESTIONS.theory.map((q, i) => (
            <Card key={i}>
              <p className="text-emerald-400 text-xs font-bold mb-1">Question {i + 1}</p>
              <p className="text-white font-medium mb-3">{q.q}</p>
              <textarea
                rows={3} placeholder="Votre réponse..."
                value={answers[`t${i}`] || ""}
                onChange={e => setAnswers(a => ({ ...a, [`t${i}`]: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl p-3 text-gray-200 text-sm resize-none focus:outline-none transition-colors"
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Part 2: Practical */}
      <div className="mb-8">
        <h3 className="text-lg font-black text-white mb-4 pb-2 border-b border-gray-700">Partie 2 — Exercices SQL</h3>
        <div className="space-y-4">
          {EXAM_QUESTIONS.practical.map((q, i) => (
            <Card key={i}>
              <p className="text-purple-400 text-xs font-bold mb-1">Exercice {i + 1}</p>
              <p className="text-white font-medium mb-3">{q.q}</p>
              <textarea
                rows={4} placeholder="Écrivez votre requête SQL ici..."
                value={answers[`p${i}`] || ""}
                onChange={e => setAnswers(a => ({ ...a, [`p${i}`]: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl p-3 text-emerald-300 text-sm font-mono resize-none focus:outline-none transition-colors"
              />
            </Card>
          ))}
        </div>
      </div>

      <button onClick={submit}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg transition-all hover:scale-[1.01] flex items-center justify-center gap-2">
        <CheckCircle className="w-6 h-6" /> Soumettre l'Examen
      </button>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Accueil" },
  { id: "course", icon: BookOpen, label: "Cours" },
  { id: "playground", icon: Zap, label: "Playground" },
  { id: "erd", icon: Map, label: "Schéma BDD" },
  { id: "cheatsheet", icon: CreditCard, label: "Mémo Rapide" },
  { id: "quiz", icon: Brain, label: "Quiz" },
  { id: "exam", icon: FileText, label: "Examen Final" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = { home: HeroPage, course: CoursePage, playground: PlaygroundPage, erd: ErdPage, cheatsheet: CheatsheetPage, quiz: QuizPage, exam: ExamPage };
  const PageComponent = pages[page] || HeroPage;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex" style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="px-4 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Database className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-white font-black text-sm leading-tight">SQL Exam</p>
              <p className="text-emerald-400 text-xs">Préparation</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page === item.id ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
            <p className="text-emerald-400 font-bold mb-1 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Conseil</p>
            <p className="text-gray-400">Commence par le Cours, puis le Quiz, puis l'Examen Final !</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800 flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {NAV_ITEMS.find(n => n.id === page) && (() => {
              const item = NAV_ITEMS.find(n => n.id === page);
              const Icon = item?.icon;
              return (
                <span className="text-gray-300 text-sm font-bold flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />} {item?.label}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-xs font-bold hidden sm:block">Examen demain</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <PageComponent setPage={setPage} />
        </main>
      </div>
    </div>
  );
}
