import React, { useState } from "react";
import { patients } from "../data/hospitalData";
import { useAuth } from "../auth/AuthContext";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const myPatients = patients.filter(p => p.primaryDoctorId === user.doctorId);
  const filtered = myPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="container">
      <h2>Doctor Dashboard</h2>
      <button onClick={logout} style={{float: "right"}}>Logout</button>
      <input
        type="text"
        placeholder="Search patients by name"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom:"1rem"}}
      />
      <ul>
        {filtered.length === 0 && <li>No patients found.</li>}
        {filtered.map(p => (
          <li key={p.id}>
            <b>{p.name}</b> (Age: {p.age})<br />
            Contact: {p.contact}<br />
            Medical History: {p.medicalHistory.join(", ")}<br />
            Medications: {p.currentMedications.join(", ")}<br />
            Appointments:
            <ul>
              {p.appointments.map((a, i) => (
                <li key={i}>{a.date}: {a.reason}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}