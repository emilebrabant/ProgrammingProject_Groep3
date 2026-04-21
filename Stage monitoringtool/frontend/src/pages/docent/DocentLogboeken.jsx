import DocentShell from './DocentShell';

export default function DocentLogboeken() {
  return (
    <DocentShell
      title="Logboeken"
      subtitle="Bekijk hier de logboeken van je gekoppelde studenten."
      activeTab="logboeken"
    >
      <div className="alert alert-info mb-0">
        Logboeken-tab is klaar in de shell. Als je wil, kan ik deze hierna meteen koppelen aan echte docent-logboekdata.
      </div>
    </DocentShell>
  );
}