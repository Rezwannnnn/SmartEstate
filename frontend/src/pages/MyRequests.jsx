import { useEffect, useState } from "react";
import { getAllRequests, updateRequestStatus } from "../services/requestService";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await getAllRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(id, { status });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update request");
    }
  };

  if (loading) return <main style={{ padding: "100px 40px" }}><p>Loading requests...</p></main>;

  return (
    <main style={{ padding: "100px 40px 40px" }}>
      <h1 style={{ marginBottom: 24 }}>My Requests</h1>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {requests.map((request) => (
            <div
              key={request._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                background: "#fff",
                padding: 20,
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                {request.propertyId?.title || "Property"}
              </h3>
              <p><strong>Requester:</strong> {request.requesterName}</p>
              <p><strong>Email:</strong> {request.requesterEmail}</p>
              <p><strong>Offer Amount:</strong> ৳ {request.offerAmount}</p>
              <p><strong>Message:</strong> {request.message || "No message"}</p>
              <p><strong>Status:</strong> {request.status}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                {request.status === "Requested" && (
                  <>
                    <button onClick={() => handleStatusChange(request._id, "Accepted")} style={buttonStyle("#0f172a")}>
                      Accept
                    </button>
                    <button onClick={() => handleStatusChange(request._id, "Rejected")} style={buttonStyle("#991b1b")}>
                      Reject
                    </button>
                    <button onClick={() => handleStatusChange(request._id, "Cancelled")} style={buttonStyle("#475569")}>
                      Cancel
                    </button>
                  </>
                )}

                {request.status === "Accepted" && (
                  <>
                    <button onClick={() => handleStatusChange(request._id, "Completed")} style={buttonStyle("#166534")}>
                      Complete
                    </button>
                    <button onClick={() => handleStatusChange(request._id, "Cancelled")} style={buttonStyle("#475569")}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function buttonStyle(background) {
  return {
    padding: "10px 16px",
    border: "none",
    borderRadius: 999,
    background,
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  };
}

export default MyRequests;