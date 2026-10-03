import usePublishReadiness from "../hooks/usePublishReadiness";

export default function StoreSetupProgress() {
  const {
    overallPercentage,
    completed,
    total,
    requiredCompleted,
    requiredTotal,
  } = usePublishReadiness();

  return (
    <div className="hlm-setup-progress" aria-label="Store setup progress">
      <div className="hlm-setup-progress-row">
        <span>Overall profile</span>
        <strong>
          {completed} of {total}
        </strong>
      </div>
      <div className="hlm-setup-progress-track" aria-hidden="true">
        <span style={{ width: `${overallPercentage}%` }} />
      </div>
      <p>
        Required to publish: <strong>{requiredCompleted} of {requiredTotal}</strong>
      </p>
    </div>
  );
}
