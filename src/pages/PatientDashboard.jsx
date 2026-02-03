import React from "react";
import { patients, doctors } from "../data/hospitalData";
import { useAuth } from "../auth/AuthContext";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const patient = patients.find(p => p.id === user.patientId);
  const doctor = doctors.find(d => d.id === patient.primaryDoctorId);
  return (
    <div className="container">
      <h2>Patient Dashboard</h2>
      <button onClick={logout} style={{float: "right"}}>Logout</button>
      <p><b>Name:</b> {patient.name}</p>
      <p><b>Age:</b> {patient.age}</p>
      <p><b>Gender:</b> {patient.gender}</p>
      <p><b>Contact:</b> {patient.contact}</p>
      <p><b>Doctor:</b> {doctor.name} ({doctor.specialty})</p>
      <p><b>Medical History:</b> {patient.medicalHistory.join(", ")}</p>
      <p><b>Current Medications:</b> {patient.currentMedications.join(", ")}</p>
      <h3>Appointments</h3>
      <ul>
        {patient.appointments.map((a, i) => (
          <li key={i}>{a.date}: {a.reason}</li>
        ))}
      </ul>
    </div>
  );
}