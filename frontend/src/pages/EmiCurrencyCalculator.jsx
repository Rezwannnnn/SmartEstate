import { useEffect, useState } from "react";

export default function EmiCurrencyCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");

  const [fromCurrency, setFromCurrency] = useState("BDT");
  const [toCurrency, setToCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState(["BDT", "USD", "EUR", "GBP", "INR"]);

  const [emi, setEmi] = useState(null);
  const [convertedEmi, setConvertedEmi] = useState(null);
  const [liveRate, setLiveRate] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("https://api.frankfurter.dev/v2/currencies");

        if (!response.ok) {
          throw new Error("Failed to load currencies.");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const codes = data.map((item) => item?.code).filter(Boolean);
          if (codes.length > 0) {
            setCurrencies(codes);
          }
        } else if (data && typeof data === "object") {
          setCurrencies(Object.keys(data));
        }
      } catch (err) {
        console.error("Currency fetch error:", err);
        setCurrencies(["BDT", "USD", "EUR", "GBP", "INR"]);
      }
    };

    fetchCurrencies();
  }, []);

  const calculateEmi = async () => {
    setError("");
    setLoading(true);

    try {
      const P = parseFloat(loanAmount);
      const annualRate = parseFloat(interestRate);
      const years = parseInt(tenure, 10);
      const N = years * 12;

      if (!P || !annualRate || !N) {
        throw new Error("Please fill all fields correctly.");
      }

      const R = annualRate / 12 / 100;
      const emiValue =
        (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);

      const totalPayable = emiValue * N;
      const totalInterestPayable = totalPayable - P;

      setEmi(emiValue.toFixed(2));
      setTotalPayment(totalPayable.toFixed(2));
      setTotalInterest(totalInterestPayable.toFixed(2));

      if (fromCurrency === toCurrency) {
        setLiveRate(1);
        setConvertedEmi(emiValue.toFixed(2));
        return;
      }

      const rateResponse = await fetch(
        `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}`
      );

      if (!rateResponse.ok) {
        throw new Error("Failed to fetch live exchange rate.");
      }

      const rateData = await rateResponse.json();

      if (!rateData?.rate) {
        throw new Error("Exchange rate not available.");
      }

      const rate = rateData.rate;
      setLiveRate(rate);
      setConvertedEmi((emiValue * rate).toFixed(2));
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setEmi(null);
      setConvertedEmi(null);
      setLiveRate(null);
      setTotalPayment(null);
      setTotalInterest(null);
    } finally {
      setLoading(false);
    }
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
            EMI Calculator with Currency Conversion
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: 620,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Calculate your monthly EMI and convert it live from one currency to another.
          </p>

          <div
            style={{
              marginTop: 28,
              borderRadius: 28,
              overflow: "hidden",
              minHeight: 460,
              background:
                "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 40%, #e2e8f0 100%)",
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
                Live Currency Mortgage Planning
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "#475569",
                  maxWidth: 440,
                  lineHeight: 1.7,
                  margin: "0 auto 28px",
                  textAlign: "center",
                }}
              >
                Select any supported source and target currency to compare your
                EMI instantly with a live exchange rate.
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
                Currency Loan Summary
              </div>

              <div style={summaryGridStyle}>
                <SummaryItem
                  label="Loan Amount"
                  value={
                    loanAmount
                      ? `${Number(loanAmount).toLocaleString()} ${fromCurrency}`
                      : "--"
                  }
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
                  value={emi ? `${emi} ${fromCurrency}` : "--"}
                />
                <SummaryItem
                  label="Exchange Rate"
                  value={
                    liveRate
                      ? `1 ${fromCurrency} = ${liveRate} ${toCurrency}`
                      : "--"
                  }
                />
                <SummaryItem
                  label="Converted EMI"
                  value={convertedEmi ? `${convertedEmi} ${toCurrency}` : "--"}
                />
                <SummaryItem
                  label="Total Payment"
                  value={totalPayment ? `${totalPayment} ${fromCurrency}` : "--"}
                />
                <SummaryItem
                  label="Total Interest"
                  value={totalInterest ? `${totalInterest} ${fromCurrency}` : "--"}
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
            Currency EMI Calculator
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
            <label style={labelStyle}>From Currency</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              style={inputStyle}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>To Currency</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={inputStyle}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
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

          <button onClick={calculateEmi} style={buttonStyle} disabled={loading}>
            {loading ? "Calculating..." : "Calculate EMI"}
          </button>

          {error && (
            <p
              style={{
                marginTop: 16,
                color: "#dc2626",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              {error}
            </p>
          )}

          {(emi || convertedEmi) && !error && (
            <div
              style={{
                marginTop: 26,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "20px 22px",
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    marginBottom: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Estimated Monthly EMI ({fromCurrency})
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {emi}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    marginBottom: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Live Exchange Rate
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#0f172a",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  1 {fromCurrency} = {liveRate} {toCurrency}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    marginBottom: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Converted EMI ({toCurrency})
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#0f172a",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {convertedEmi}
                </div>
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
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          fontFamily: "'DM Sans', sans-serif",
          wordBreak: "break-word",
          lineHeight: 1.35,
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