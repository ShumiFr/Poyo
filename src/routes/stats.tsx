import { createFileRoute } from "@tanstack/react-router";
import { useBudget, moisActif } from "../store/useBudget";
import { calculerRecap } from "../lib/calculs";
import { serieMensuelle, repartitionDepenses } from "../lib/stats";
import format, { libelleMois } from "../lib/format";
import GraphiqueBarres from "../components/GraphiqueBarres";
import GraphiqueLigne from "../components/GraphiqueLigne";

export const Route = createFileRoute("/stats")({
   component: StatsComponent,
});

function StatsComponent() {
   const moisListe = useBudget((state) => state.moisListe);
   const mois = useBudget(moisActif);

   // Chiffres clés du mois affiché
   const recap = calculerRecap(mois);
   const epargne =
      mois.enveloppes.reduce((s, e) => s + e.montant, 0) +
      mois.voeux.reduce((s, v) => s + v.montantActuel, 0);

   // Séries pour les graphiques (6 derniers mois)
   const serie = serieMensuelle(moisListe);

   // Répartition des dépenses du mois
   const rep = repartitionDepenses(mois);
   const familles = [
      { nom: "Régulières", montant: rep.regulieres, couleur: "var(--rouge)" },
      { nom: "Courses", montant: rep.courses, couleur: "var(--teal)" },
      { nom: "Ponctuelles", montant: rep.ponctuelles, couleur: "var(--orange)" },
      { nom: "Prévisionnel", montant: rep.previsionnel, couleur: "var(--cat-navy)" },
   ].filter((f) => f.montant > 0);
   const maxFamille = Math.max(1, ...familles.map((f) => f.montant));

   return (
      <>
         <div className="screen-titre-row">
            <h2>Statistiques</h2>
            <span className="screen-resume info">{libelleMois(mois.mois, mois.annee)}</span>
         </div>

         {/* Chiffres clés du mois */}
         <div className="stats-kpis">
            <div className="kpi">
               <div className="kpi-valeur text-green">{format(recap.revenusAffiches)}</div>
               <div className="kpi-label">Revenus</div>
            </div>
            <div className="kpi">
               <div className="kpi-valeur text-red">{format(recap.chargesPayees)}</div>
               <div className="kpi-label">Dépenses</div>
            </div>
            <div className="kpi">
               <div className="kpi-valeur" style={{ color: "var(--teal)" }}>{format(epargne)}</div>
               <div className="kpi-label">Épargne</div>
            </div>
         </div>

         {/* Revenus vs Dépenses */}
         <div className="card">
            <h3>Revenus vs Dépenses</h3>
            <div className="graph-legende">
               <span><span className="pastille" style={{ background: "var(--vert)" }} />Revenus</span>
               <span><span className="pastille" style={{ background: "var(--rouge)" }} />Dépenses</span>
            </div>
            <GraphiqueBarres data={serie} />
         </div>

         {/* Évolution du solde */}
         <div className="card">
            <h3>Évolution du solde</h3>
            <p className="sous">Solde du compte en fin de mois</p>
            <GraphiqueLigne data={serie} />
         </div>

         {/* Où part l'argent ce mois */}
         <div className="card">
            <h3>Où part l'argent ce mois</h3>
            {familles.length === 0 ? (
               <p className="sous">Aucune dépense ce mois pour l'instant.</p>
            ) : (
               <div className="repartition">
                  {familles.map((f) => (
                     <div key={f.nom} className="repartition-ligne">
                        <div className="repartition-tete">
                           <span>{f.nom}</span>
                           <span className="repartition-montant">{format(f.montant)}</span>
                        </div>
                        <div className="repartition-piste">
                           <div className="repartition-barre" style={{ width: (f.montant / maxFamille) * 100 + "%", background: f.couleur }} />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </>
   );
}
