import MentorShell from './MentorShell';

export default function MentorLogboeken() {
  return (
    <MentorShell
      title="Logboeken"
      subtitle="Bekijk hier de logboeken van gekoppelde studenten."
      activeTab="logboeken"
    >
      <div className="alert alert-info mb-0">
        Logboeken-tab is klaar in de shell. Als je wil, kan ik hierna ook meteen de backend koppelen om echte logboekdata voor mentor te tonen.
      </div>
    </MentorShell>
  );
}