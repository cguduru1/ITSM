import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

export default function RiskEngine() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: { questions: [{ text: "Default Question", weight: 1 }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  // Watch all questions for live updates
  const questions = watch("questions");

  // ✅ Calculate total risk score dynamically
  const totalRiskScore = useMemo(() => {
    return questions?.reduce((sum, q) => sum + (Number(q.weight) || 0), 0);
  }, [questions]);

  const riskLevel =
    totalRiskScore < 5 ? "Low" : totalRiskScore < 10 ? "Medium" : "High";

  const onSubmit = (data) => {
    console.log("SUCCESS: Risk engine rules data ->", data);
    alert("Rules Saved Successfully!");
  };

  const onError = (formErrors) => {
    console.error("VALIDATION ERROR ->", formErrors);
  };

   return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header">
      <header className="quantum-header">
        <h1>🛡 Risk Assessment Engine</h1>
        <p>
          Weighted questions per CI class and outage impact
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {/* Form */}
       <form
        id="risk-engine-form"
        className="quantum-page-body quantum-grid"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        {/* Questions Panel */}
        <section className="quantum-panel" style={{ gridColumn: "1 / -1" }}>
          <h3 className="quantum-heading">Questions</h3>
          <div className="quantum-card">
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="quantum-flex quantum-align-center"
                style={{ gap: "8px", marginBottom: "8px" }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    {...register(`questions.${i}.text`, {
                      required: "Question text is required"
                    })}
                    placeholder="Question text"
                    className="quantum-input"
                  />
                  {errors.questions?.[i]?.text && (
                    <p className="quantum-error">
                      {errors.questions[i].text.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    {...register(`questions.${i}.weight`, {
                      required: "Weight is required",
                      min: { value: 1, message: "Weight must be ≥ 1" }
                    })}
                    className="quantum-input"
                    style={{ width: "80px" }}
                  />
                  {errors.questions?.[i]?.weight && (
                    <p className="quantum-error">
                      {errors.questions[i].weight.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="quantum-btn quantum-btn-danger"
                  onClick={() => remove(i)}
                >
                  ✖ Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="quantum-btn quantum-btn-primary"
              onClick={() => append({ text: "", weight: 1 })}
              style={{ marginTop: "8px" }}
            >
              ➕ Add Question
            </button>
          </div>
        </section>

        {/* Dynamic Risk Score */}
        <section className="quantum-panel" style={{ gridColumn: "1 / -1" }}>
          <div className="quantum-card quantum-flex quantum-justify-between quantum-align-center">
            <span className="quantum-label">Total Risk Score</span>
            <span
              className={
                riskLevel === "Low"
                  ? "quantum-badge quantum-badge-success"
                  : riskLevel === "Medium"
                  ? "quantum-badge quantum-badge-warning"
                  : "quantum-badge quantum-badge-danger"
              }
            >
              {totalRiskScore} ({riskLevel})
            </span>
          </div>
        </section>

        {/* Submit Button */}
        <section className="quantum-panel" style={{ gridColumn: "1 / -1" }}>
          <div className="quantum-card quantum-flex quantum-justify-center">
            <button
              className="quantum-btn quantum-btn-success"
              type="submit"
              form="risk-engine-form"
              onClick={() => console.log("Save button physically clicked...")}
            >
              💾 Save Risk Rules
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}