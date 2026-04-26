import { useState } from "react";

export default function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [emi, setEmi] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);

  const calculateEmi = () => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseInt(tenure, 10);
    const N = years * 12;

    if (!P || !annualRate || !N) {
      alert("Please fill all fields correctly.");
      return;
    }

    const R = annualRate / 12 / 100;
    const emiValue =
      (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

    const totalPayable = emiValue * N;
    const totalInterestPayable = totalPayable - P;

    setEmi(emiValue.toFixed(2));
    setTotalPayment(totalPayable.toFixed(2));
    setTotalInterest(totalInterestPayable.toFixed(2));
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "120px 60px 60px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#0f172a",
              marginBottom: 18,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            EMI Calculator
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: 560,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Estimate your monthly mortgage installment by entering your loan
            amount, interest rate, and tenure. This helps buyers understand
            affordability before making a property decision.
          </p>

          <div
            style={{
              marginTop: 28,
              borderRadius: 28,
              overflow: "hidden",
              minHeight: 460,
              background:
                "linear-gradient(135deg, #dbeafe 0%, #e2e8f0 45%, #cbd5e1 100%)",
              boxShadow: "0 24px 50px rgba(15,23,42,0.10)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                color: "#0f172a",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Smart Mortgage Planning
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "#475569",
                  maxWidth: 420,
                  lineHeight: 1.7,
                  margin: "0 auto 28px",
                  textAlign: "center",
                }}
              >
                Use this calculator to preview your monthly EMI and compare
                financing options before purchasing your property.
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.65)",
                borderRadius: 22,
                padding: 24,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 18,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Loan Summary
              </div>

              <div style={summaryGridStyle}>
                <SummaryItem
                  label="Loan Amount"
                  value={loanAmount ? Number(loanAmount).toLocaleString() : "--"}
                />
                <SummaryItem
                  label="Interest Rate"
                  value={interestRate ? `${interestRate}%` : "--"}
                />
                <SummaryItem
                  label="Tenure"
                  value={tenure ? `${tenure} years` : "--"}
                />
                <SummaryItem
                  label="Monthly EMI"
                  value={emi || "--"}
                />
                <SummaryItem
                  label="Total Payment"
                  value={totalPayment || "--"}
                />
                <SummaryItem
                  label="Total Interest"
                  value={totalInterest || "--"}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe2ea",
            borderRadius: 28,
            padding: 40,
            boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
          }}
        >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 28,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Calculate Your EMI
          </h2>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Loan Amount</label>
            <input
              type="number"
              placeholder="Enter loan amount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Interest Rate (%)</label>
            <input
              type="number"
              placeholder="Enter annual interest rate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Tenure (Years)</label>
            <input
              type="number"
              placeholder="Enter loan tenure"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={calculateEmi} style={buttonStyle}>
            Calculate EMI
          </button>

          {emi && (
            <div
              style={{
                marginTop: 26,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginBottom: 8,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Estimated Monthly Installment
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#0f172a",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {emi}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(203,213,225,0.9)",
        borderRadius: 18,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "#0f172a",
          fontFamily: "'DM Sans', sans-serif",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const labelStyle = {
  display: "block",
  marginBottom: 10,
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  height: 54,
  borderRadius: 16,
  border: "1px solid #d7dee7",
  padding: "0 16px",
  fontSize: 16,
  outline: "none",
  background: "#fff",
  color: "#0f172a",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

const buttonStyle = {
  width: "100%",
  height: 62,
  borderRadius: 18,
  border: "none",
  background: "#0b1736",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  boxShadow: "0 10px 24px rgba(11,23,54,0.20)",
};