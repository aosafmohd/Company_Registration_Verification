import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await API.get("/company");
      setCompany(res.data.data);
    } catch (err) {
      // Company does not exist (404)
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    if (!companyName) {
      alert("Company name is required");
      return;
    }

    try {
      const res = await API.post("/company", {
        company_name: companyName,
      });
      setCompany(res.data.data);
    } catch (err) {
      alert("Error creating company");
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>Dashboard</h2>

      {company ? (
        <div>
          <h3>Company Profile</h3>
          <p>
            <strong>Name:</strong> {company.company_name}
          </p>
          <p>
            <strong>Owner ID:</strong> {company.owner_id}
          </p>
          <p>
            <strong>Created At:</strong> {company.created_at}
          </p>
        </div>
      ) : (
        <div>
          <h3>Create Company Profile</h3>
          <input
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <br />
          <br />
          <button onClick={createCompany}>Create Company</button>
        </div>
      )}
    </div>
  );
}
