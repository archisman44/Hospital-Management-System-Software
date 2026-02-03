import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { doctors as initialDoctors, patients as initialPatients, hospitalInfo } from "../data/hospitalData";
import { majorSpecializations } from "../data/doctorSpecializations";
import { users as initialUsers } from "../data/users";

// Simulated API functions (replace with real API calls)
const fakeApi = {
  deleteDoctor: async (id) => true,
  deletePatient: async (id) => true,
  addDoctor: async (doc) => doc,
  updateDoctor: async (doc) => doc,
  addPatient: async (pat) => pat,
  updatePatient: async (pat) => pat,
};

export default function AdminDashboard() {
  const { logout } = useAuth();

  const [doctors, setDoctors] = useState(() => {
    const stored = localStorage.getItem("doctors");
    return stored ? JSON.parse(stored) : initialDoctors;
  });
  const [patients, setPatients] = useState(() => {
    const stored = localStorage.getItem("patients");
    return stored ? JSON.parse(stored) : initialPatients;
  });
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : initialUsers;
  });

  useEffect(() => {
    localStorage.setItem("doctors", JSON.stringify(doctors));
  }, [doctors]);
  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // For editing/adding doctors
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    id: "",
    name: "",
    majorSpecialization: "",
    specialization: "",
    contact: "",
    email: "",
    available: "",
    department: "",
    yearsOfExperience: "",
    password: "",
  });
  const [addingDoctor, setAddingDoctor] = useState(false);

  // For editing/adding patients
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    contact: "",
    address: "",
    medicalHistory: "",
    currentMedications: "",
    primaryDoctorId: "",
    appointments: "",
    bloodGroup: "",
    emergencyContact: "",
    insuranceDetails: "",
    password: "",
  });
  const [addingPatient, setAddingPatient] = useState(false);

  // View section & search for admin panel
  const [section, setSection] = useState("patient"); // "patient" or "doctor"
  const [search, setSearch] = useState("");

  // For detail view
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // For assigned patients to doctor
  const [assignedPatientsView, setAssignedPatientsView] = useState(false);
  const [assignedPatientsDoctor, setAssignedPatientsDoctor] = useState(null);

  // For patient details modal/page in doctor dashboard
  const [openPatientDetails, setOpenPatientDetails] = useState(null);

  // Utility: get doctor by ID
  const getDoctorById = (id) => doctors.find((d) => d.id === Number(id));
  // Utility: get patients for doctor
  const getPatientsByDoctorId = (doctorId) =>
    patients.filter((pat) => Number(pat.primaryDoctorId) === Number(doctorId));

  // Filtered lists
  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.contact.toLowerCase().includes(search.toLowerCase()) ||
    (doc.department && doc.department.toLowerCase().includes(search.toLowerCase())) ||
    ("" + doc.id).includes(search)
  );
  const filteredPatients = patients.filter(pat =>
    pat.name.toLowerCase().includes(search.toLowerCase()) ||
    (pat.contact && pat.contact.includes(search)) ||
    ("" + pat.id).includes(search)
  );

  // Doctor handlers
  const handleEditDoctor = (doc) => {
    setEditingDoctor(doc.id);
    setDoctorForm({
      ...doc,
      yearsOfExperience: doc.yearsOfExperience || "",
      department: doc.department || "",
      majorSpecialization: doc.majorSpecialization || "",
      specialization: doc.specialization || "",
      password: doc.password || "",
    });
  };
  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "majorSpecialization") {
      setDoctorForm({
        ...doctorForm,
        majorSpecialization: value,
        specialization: "" // reset subspecialization if major changes
      });
    } else {
      setDoctorForm({ ...doctorForm, [name]: value });
    }
  };
  const handleDoctorSave = async () => {
    await fakeApi.updateDoctor(doctorForm);
    setDoctors(docs =>
      docs.map(d =>
        d.id === doctorForm.id
          ? {
              ...doctorForm,
              id: parseInt(doctorForm.id),
              yearsOfExperience: doctorForm.yearsOfExperience ? parseInt(doctorForm.yearsOfExperience) : "",
            }
          : d
      )
    );
    // Update user password if changed
    setUsers(us => {
      const idx = us.findIndex(u => u.role === "doctor" && (u.doctorId === Number(doctorForm.id) || u.id === Number(doctorForm.id)));
      if (idx !== -1) {
        const newUsers = [...us];
        newUsers[idx] = {
          ...newUsers[idx],
          password: doctorForm.password,
        };
        localStorage.setItem("users", JSON.stringify(newUsers));
        return newUsers;
      }
      return us;
    });
    setEditingDoctor(null);
    setSelectedDoctor(null);
  };
  const handleAddDoctor = () => {
    setAddingDoctor(true);
    setDoctorForm({
      id: "",
      name: "",
      majorSpecialization: "",
      specialization: "",
      contact: "",
      email: "",
      available: "",
      department: "",
      yearsOfExperience: "",
      password: "",
    });
  };
  const handleDoctorAddSave = async () => {
    await fakeApi.addDoctor(doctorForm);
    const newDoctor = {
      ...doctorForm,
      id: parseInt(doctorForm.id),
      yearsOfExperience: doctorForm.yearsOfExperience ? parseInt(doctorForm.yearsOfExperience) : "",
    };
    setDoctors(docs => [...docs, newDoctor]);
    // Add to users
    const doctorUsername = doctorForm.name.trim().toLowerCase().replace(/\s+/g, "");
    const userEntry = {
      username: doctorUsername,
      password: doctorForm.password,
      role: "doctor",
      doctorId: parseInt(doctorForm.id),
    };
    setUsers(us => {
      const updated = [...us, userEntry];
      localStorage.setItem("users", JSON.stringify(updated));
      return updated;
    });
    setAddingDoctor(false);
  };
  const handleDeleteDoctor = async (id) => {
    await fakeApi.deleteDoctor(id);
    setDoctors(docs => docs.filter(d => d.id !== id));
    setUsers(us => {
      const updated = us.filter(u => !(u.role === "doctor" && (u.doctorId === Number(id) || u.id === Number(id))));
      localStorage.setItem("users", JSON.stringify(updated));
      return updated;
    });
    setSelectedDoctor(null);
    setAssignedPatientsView(false);
    setAssignedPatientsDoctor(null);
    setOpenPatientDetails(null);
  };

  // Patient handlers
  const handleEditPatient = (pat) => {
    setEditingPatient(pat.id);
    setPatientForm({
      ...pat,
      medicalHistory: Array.isArray(pat.medicalHistory) ? pat.medicalHistory.join(", ") : pat.medicalHistory,
      currentMedications: Array.isArray(pat.currentMedications) ? pat.currentMedications.join(", ") : pat.currentMedications,
      appointments: Array.isArray(pat.appointments)
        ? pat.appointments.map(a => `${a.date}|${a.doctorId}|${a.reason}`).join("; ")
        : pat.appointments,
      bloodGroup: pat.bloodGroup || "",
      emergencyContact: pat.emergencyContact || "",
      insuranceDetails: pat.insuranceDetails || "",
      password: pat.password || "",
    });
  };
  const handlePatientFormChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };
  const handlePatientSave = async () => {
    await fakeApi.updatePatient(patientForm);
    setPatients(pats =>
      pats.map(p =>
        p.id === patientForm.id
          ? {
              ...patientForm,
              id: parseInt(patientForm.id),
              age: parseInt(patientForm.age),
              primaryDoctorId: parseInt(patientForm.primaryDoctorId),
              medicalHistory: patientForm.medicalHistory.split(",").map(s => s.trim()),
              currentMedications: patientForm.currentMedications.split(",").map(s => s.trim()),
              appointments: patientForm.appointments
                .split(";")
                .filter(Boolean)
                .map(a => {
                  const [date, doctorId, reason] = a.split("|").map(s => s.trim());
                  return { date, doctorId: parseInt(doctorId), reason };
                }),
              bloodGroup: patientForm.bloodGroup,
              emergencyContact: patientForm.emergencyContact,
              insuranceDetails: patientForm.insuranceDetails
            }
          : p
      )
    );
    // Update user password if changed
    setUsers(us => {
      const idx = us.findIndex(u => u.role === "patient" && (u.patientId === Number(patientForm.id) || u.id === Number(patientForm.id)));
      if (idx !== -1) {
        const newUsers = [...us];
        newUsers[idx] = {
          ...newUsers[idx],
          password: patientForm.password,
        };
        localStorage.setItem("users", JSON.stringify(newUsers));
        return newUsers;
      }
      return us;
    });
    setEditingPatient(null);
    setOpenPatientDetails(null);
  };
  const handleAddPatient = () => {
    setAddingPatient(true);
    setPatientForm({
      id: "",
      name: "",
      age: "",
      gender: "",
      contact: "",
      address: "",
      medicalHistory: "",
      currentMedications: "",
      primaryDoctorId: "",
      appointments: "",
      bloodGroup: "",
      emergencyContact: "",
      insuranceDetails: "",
      password: "",
    });
  };
  const handlePatientAddSave = async () => {
    await fakeApi.addPatient(patientForm);
    const newPatient = {
      ...patientForm,
      id: parseInt(patientForm.id),
      age: parseInt(patientForm.age),
      primaryDoctorId: parseInt(patientForm.primaryDoctorId),
      medicalHistory: patientForm.medicalHistory.split(",").map(s => s.trim()),
      currentMedications: patientForm.currentMedications.split(",").map(s => s.trim()),
      appointments: patientForm.appointments
        .split(";")
        .filter(Boolean)
        .map(a => {
          const [date, doctorId, reason] = a.split("|").map(s => s.trim());
          return { date, doctorId: parseInt(doctorId), reason };
        }),
      bloodGroup: patientForm.bloodGroup,
      emergencyContact: patientForm.emergencyContact,
      insuranceDetails: patientForm.insuranceDetails
    };
    setPatients(pats => [...pats, newPatient]);
    // Add to users
    const patientUsername = patientForm.name.trim().toLowerCase().replace(/\s+/g, "");
    const userEntry = {
      username: patientUsername,
      password: patientForm.password,
      role: "patient",
      patientId: parseInt(patientForm.id),
    };
    setUsers(us => {
      const updated = [...us, userEntry];
      localStorage.setItem("users", JSON.stringify(updated));
      return updated;
    });
    setAddingPatient(false);
  };
  const handleDeletePatient = async (id) => {
    await fakeApi.deletePatient(id);
    setPatients(pats => pats.filter(p => p.id !== id));
    setUsers(us => {
      const updated = us.filter(u => !(u.role === "patient" && (u.patientId === Number(id) || u.id === Number(id))));
      localStorage.setItem("users", JSON.stringify(updated));
      return updated;
    });
    setOpenPatientDetails(null);
  };

  // Details view for patient (global, only one instance)
  function renderPatientDetailsPage(pat, onBack) {
    const primaryDoc = getDoctorById(pat.primaryDoctorId);
    // Find user for password (in case it changed)
    const userObj = users.find(
      u => u.role === "patient" && (u.patientId === pat.id || u.id === pat.id)
    );
    return (
      <div style={{ margin: "20px 0", padding: 16, border: "2px solid #1976d2", borderRadius: 6, background: "#f6fbff" }}>
        <b>ID:</b> {pat.id}<br />
        <b>Name:</b> {pat.name}<br />
        <b>Password:</b> {userObj?.password || pat.password || <span style={{color:"#888"}}>N/A</span>}<br />
        <b>Age:</b> {pat.age}<br />
        <b>Gender:</b> {pat.gender}<br />
        <b>Contact:</b> {pat.contact}<br />
        <b>Address:</b> {pat.address}<br />
        <b>Primary Doctor ID:</b> {pat.primaryDoctorId}<br />
        <b>Primary Doctor Name:</b> {primaryDoc ? primaryDoc.name : "N/A"}<br />
        <b>Primary Doctor Phone No:</b> {primaryDoc ? primaryDoc.contact : "N/A"}<br />
        <b>Blood Group:</b> {pat.bloodGroup}<br />
        <b>Emergency Contact:</b> {pat.emergencyContact}<br />
        <b>Insurance Details:</b> {pat.insuranceDetails}<br />
        <b>Medical History:</b> {Array.isArray(pat.medicalHistory) ? pat.medicalHistory.join(", ") : pat.medicalHistory}<br />
        <b>Current Medications:</b> {Array.isArray(pat.currentMedications) ? pat.currentMedications.join(", ") : pat.currentMedications}<br />
        <b>Appointments:</b>
        <div style={{ marginLeft: 20 }}>
          {Array.isArray(pat.appointments) && pat.appointments.length > 0 ? (
            pat.appointments.map((a, i) => {
              const doc = getDoctorById(a.doctorId);
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <b>Date:</b> {a.date} | <b>Doctor ID:</b> {a.doctorId} | <b>Doctor Name:</b> {doc ? doc.name : "N/A"} | <b>Doctor Phone No:</b> {doc ? doc.contact : "N/A"} | <b>Reason:</b> {a.reason}
                </div>
              );
            })
          ) : (
            <span>No appointments</span>
          )}
        </div>
        <button onClick={() => handleEditPatient(pat)}>Edit</button>
        <button onClick={() => handleDeletePatient(pat.id)} style={{ color: "red", marginLeft: 8 }}>Delete</button>
        <button onClick={onBack} style={{ marginLeft: 16 }}>Back</button>
      </div>
    );
  }

  // Details view for doctor
  function renderDoctorDetails(doc) {
    const assignedPatients = getPatientsByDoctorId(doc.id);
    // Find user for password (in case it changed)
    const userObj = users.find(
      u => u.role === "doctor" && (u.doctorId === doc.id || u.id === doc.id)
    );
    return (
      <div style={{ margin: "20px 0", padding: 16, border: "1px solid #ccc", borderRadius: 6 }}>
        <b>ID:</b> {doc.id}<br />
        <b>Name:</b> {doc.name}<br />
        <b>Password:</b> {userObj?.password || doc.password || <span style={{color:"#888"}}>N/A</span>}<br />
        <b>Department:</b> {doc.department}<br />
        <b>Major Specialization:</b> {doc.majorSpecialization}<br />
        <b>Specialization:</b> {doc.specialization}<br />
        <b>Contact:</b> {doc.contact}<br />
        <b>Email:</b> {doc.email}<br />
        <b>Available:</b> {doc.available}<br />
        <b>Years of Experience:</b> {doc.yearsOfExperience}<br />
        <b>Assigned Patients:</b> {assignedPatients.length}
        <div style={{ margin: "12px 0" }}>
          <button onClick={() => handleEditDoctor(doc)}>Edit</button>
          <button onClick={() => handleDeleteDoctor(doc.id)} style={{ color: "red", marginLeft: 8 }}>Delete</button>
          <button onClick={() => setSelectedDoctor(null)} style={{ marginLeft: 16 }}>Back</button>
          <button onClick={() => { setAssignedPatientsView(true); setAssignedPatientsDoctor(doc); setSelectedDoctor(null); }} style={{ marginLeft: 16 }}>
            Assigned Patients ({assignedPatients.length})
          </button>
        </div>
      </div>
    );
  }

  // Show assigned patients for a particular doctor
  function renderAssignedPatients(doctor) {
    const assignedPatients = getPatientsByDoctorId(doctor.id);
    return (
      <div style={{ margin: "20px 0", padding: 16, border: "2px solid #1976d2", borderRadius: 6 }}>
        <h4>Patients assigned to Dr. {doctor.name} (ID: {doctor.id})</h4>
        <button onClick={() => { setAssignedPatientsView(false); setAssignedPatientsDoctor(null); }}>Back</button>
        {assignedPatients.length === 0 ? (
          <div style={{ color: "#888", marginTop: 16 }}>No patients assigned to this doctor.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Phone</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {assignedPatients.map(pat =>
                <tr key={pat.id}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.id}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.name}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.contact}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <button onClick={() => setOpenPatientDetails({ patient: pat, backTo: "assigned" })}>View Details</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // --- EDIT FORMS ---
  // Doctor edit form
  function renderDoctorEditForm() {
    return (
      <div style={{ margin: "20px 0", padding: 16, border: "1px solid #1976d2", borderRadius: 6, background: "#f6fbff" }}>
        <h4>Edit Doctor</h4>
        <input name="id" value={doctorForm.id} disabled placeholder="ID" style={{ width: 70, marginRight: 6 }} />
        <input name="name" value={doctorForm.name} onChange={handleDoctorFormChange} placeholder="Name" style={{ width: 130, marginRight: 6 }} />
        <select
          name="majorSpecialization"
          value={doctorForm.majorSpecialization}
          onChange={handleDoctorFormChange}
          required
          style={{ marginRight: 6 }}
        >
          <option value="">Main Specialization</option>
          {majorSpecializations.map(mj => (
            <option key={mj.label} value={mj.label}>{mj.label}</option>
          ))}
        </select>
        {doctorForm.majorSpecialization && (
          <select
            name="specialization"
            value={doctorForm.specialization}
            onChange={handleDoctorFormChange}
            required
            style={{ marginRight: 6 }}
          >
            <option value="">Sub-specialization</option>
            {(majorSpecializations.find(mj => mj.label === doctorForm.majorSpecialization)?.subs || []).map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        )}
        <input name="department" value={doctorForm.department} onChange={handleDoctorFormChange} placeholder="Department" style={{ width: 100, marginRight: 6 }} />
        <input name="yearsOfExperience" value={doctorForm.yearsOfExperience} onChange={handleDoctorFormChange} placeholder="Experience" style={{ width: 90, marginRight: 6 }} />
        <input name="contact" value={doctorForm.contact} onChange={handleDoctorFormChange} placeholder="Contact" style={{ width: 120, marginRight: 6 }} />
        <input name="email" value={doctorForm.email} onChange={handleDoctorFormChange} placeholder="Email" style={{ width: 140, marginRight: 6 }} />
        <input name="available" value={doctorForm.available} onChange={handleDoctorFormChange} placeholder="Available" style={{ width: 90, marginRight: 6 }} />
        <input name="password" value={doctorForm.password} onChange={handleDoctorFormChange} placeholder="Password" type="text" style={{ width: 115, marginRight: 6 }} />
        <button onClick={handleDoctorSave}>Save</button>
        <button onClick={() => setEditingDoctor(null)} style={{ marginLeft: 6 }}>Cancel</button>
      </div>
    );
  }
  // Patient edit form
  function renderPatientEditForm() {
    return (
      <div style={{ margin: "20px 0", padding: 16, border: "1px solid #1976d2", borderRadius: 6, background: "#f6fbff" }}>
        <h4>Edit Patient</h4>
        <input name="id" value={patientForm.id} disabled placeholder="ID" style={{ width: 70, marginRight: 6 }} />
        <input name="name" value={patientForm.name} onChange={handlePatientFormChange} placeholder="Name" style={{ width: 140, marginRight: 6 }} />
        <input name="age" value={patientForm.age} onChange={handlePatientFormChange} placeholder="Age" style={{ width: 60, marginRight: 6 }} />
        <input name="gender" value={patientForm.gender} onChange={handlePatientFormChange} placeholder="Gender" style={{ width: 80, marginRight: 6 }} />
        <input name="contact" value={patientForm.contact} onChange={handlePatientFormChange} placeholder="Contact" style={{ width: 110, marginRight: 6 }} />
        <input name="address" value={patientForm.address} onChange={handlePatientFormChange} placeholder="Address" style={{ width: 120, marginRight: 6 }} />
        <input name="primaryDoctorId" value={patientForm.primaryDoctorId} onChange={handlePatientFormChange} placeholder="Doctor ID" style={{ width: 80, marginRight: 6 }} />
        <input name="bloodGroup" value={patientForm.bloodGroup} onChange={handlePatientFormChange} placeholder="Blood Group" style={{ width: 90, marginRight: 6 }} />
        <input name="emergencyContact" value={patientForm.emergencyContact} onChange={handlePatientFormChange} placeholder="Emergency Contact" style={{ width: 130, marginRight: 6 }} />
        <input name="insuranceDetails" value={patientForm.insuranceDetails} onChange={handlePatientFormChange} placeholder="Insurance Details" style={{ width: 130, marginRight: 6 }} />
        <input name="password" value={patientForm.password} onChange={handlePatientFormChange} placeholder="Password" type="text" style={{ width: 115, marginRight: 6 }} />
        <br />
        <input name="medicalHistory" value={patientForm.medicalHistory} onChange={handlePatientFormChange} placeholder="Medical History (comma separated)" style={{width: "48%", marginTop: 4, marginRight: 8}} />
        <input name="currentMedications" value={patientForm.currentMedications} onChange={handlePatientFormChange} placeholder="Medications (comma separated)" style={{width: "48%", marginTop: 4}} />
        <br />
        <input name="appointments" value={patientForm.appointments} onChange={handlePatientFormChange} placeholder="Appointments (date|doctorId|reason; ...)" style={{width:"98%", marginTop: 4}} />
        <br />
        <button onClick={handlePatientSave} style={{ marginTop: 6 }}>Save</button>
        <button onClick={() => setEditingPatient(null)} style={{ marginLeft: 6, marginTop: 6 }}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="container" style={{maxWidth: 900, margin: "auto", padding: 24}}>
      <h2>Admin Platform Control</h2>
      <button onClick={logout} className="logout">Logout</button>
      <h3>Hospital Info</h3>
      <div>
        <b>Name:</b> {hospitalInfo.name}<br />
        <b>Address:</b> {hospitalInfo.address}<br />
        <b>Contact:</b> {hospitalInfo.contact}
      </div>
      {/* Section switch */}
      <div style={{margin: "24px 0 16px 0"}}>
        <button
          onClick={() => { setSection("patient"); setSearch(""); setSelectedDoctor(null); setAssignedPatientsView(false); setAssignedPatientsDoctor(null); setOpenPatientDetails(null); }}
          style={{
            marginRight: 12,
            background: section === "patient" ? "#1976d2" : "#eee",
            color: section === "patient" ? "#fff" : "#000",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Patient
        </button>
        <button
          onClick={() => { setSection("doctor"); setSearch(""); setSelectedDoctor(null); setAssignedPatientsView(false); setAssignedPatientsDoctor(null); setOpenPatientDetails(null); }}
          style={{
            background: section === "doctor" ? "#1976d2" : "#eee",
            color: section === "doctor" ? "#fff" : "#000",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Doctor
        </button>
      </div>
      <input
        type="text"
        placeholder={`Search ${section === "doctor" ? "Doctor" : "Patient"}...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20, borderRadius: 4, border: "1px solid #ccc" }}
      />

      {/* Doctor section */}
      {section === "doctor" && !selectedDoctor && !assignedPatientsView && !openPatientDetails && (
        <>
          <h3>All Doctors</h3>
          <button onClick={handleAddDoctor}>Add New Doctor</button>
          {addingDoctor && (
            <div style={{ margin: "20px 0", padding: 16, border: "1px solid #1976d2", borderRadius: 6, background: "#f6fbff" }}>
              <h4>Add Doctor</h4>
              <input name="id" value={doctorForm.id} onChange={handleDoctorFormChange} placeholder="ID" style={{ width: 70, marginRight: 6 }} />
              <input name="name" value={doctorForm.name} onChange={handleDoctorFormChange} placeholder="Name" style={{ width: 130, marginRight: 6 }} />
              <select
                name="majorSpecialization"
                value={doctorForm.majorSpecialization}
                onChange={handleDoctorFormChange}
                required
                style={{ marginRight: 6 }}
              >
                <option value="">Main Specialization</option>
                {majorSpecializations.map(mj => (
                  <option key={mj.label} value={mj.label}>{mj.label}</option>
                ))}
              </select>
              {doctorForm.majorSpecialization && (
                <select
                  name="specialization"
                  value={doctorForm.specialization}
                  onChange={handleDoctorFormChange}
                  required
                  style={{ marginRight: 6 }}
                >
                  <option value="">Sub-specialization</option>
                  {(majorSpecializations.find(mj => mj.label === doctorForm.majorSpecialization)?.subs || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}
              <input name="department" value={doctorForm.department} onChange={handleDoctorFormChange} placeholder="Department" style={{ width: 100, marginRight: 6 }} />
              <input name="yearsOfExperience" value={doctorForm.yearsOfExperience} onChange={handleDoctorFormChange} placeholder="Experience" style={{ width: 90, marginRight: 6 }} />
              <input name="contact" value={doctorForm.contact} onChange={handleDoctorFormChange} placeholder="Contact" style={{ width: 120, marginRight: 6 }} />
              <input name="email" value={doctorForm.email} onChange={handleDoctorFormChange} placeholder="Email" style={{ width: 140, marginRight: 6 }} />
              <input name="available" value={doctorForm.available} onChange={handleDoctorFormChange} placeholder="Available" style={{ width: 90, marginRight: 6 }} />
              <input name="password" value={doctorForm.password} onChange={handleDoctorFormChange} placeholder="Password" type="password" style={{ width: 115, marginRight: 6 }} />
              <button onClick={handleDoctorAddSave}>Save</button>
              <button onClick={() => setAddingDoctor(false)} style={{ marginLeft: 6 }}>Cancel</button>
            </div>
          )}
          {editingDoctor && renderDoctorEditForm()}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Phone</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Department</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Assigned Patients</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doc => {
                const assignedCount = getPatientsByDoctorId(doc.id).length;
                return (
                  <tr key={doc.id}>
                    <td style={{ padding: 8, border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedDoctor(doc)}>{doc.id}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedDoctor(doc)}>{doc.name}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedDoctor(doc)}>{doc.contact}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd", cursor: "pointer" }} onClick={() => setSelectedDoctor(doc)}>{doc.department}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                      {assignedCount}
                      <button
                        style={{ marginLeft: 10 }}
                        onClick={() => { setAssignedPatientsView(true); setAssignedPatientsDoctor(doc); }}>
                        Assigned Patients
                      </button>
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "center" }}>
                      <button onClick={() => setSelectedDoctor(doc)}>Details</button>
                      <button onClick={() => handleEditDoctor(doc)} style={{ marginLeft: 6 }}>Edit</button>
                    </td>
                  </tr>
                );
              })}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                    No doctor found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button style={{ marginTop: 25 }} onClick={() => setSection("patient")}>Back</button>
        </>
      )}
      {/* Doctor details */}
      {selectedDoctor && renderDoctorDetails(selectedDoctor)}
      {assignedPatientsView && assignedPatientsDoctor && renderAssignedPatients(assignedPatientsDoctor)}

      {/* Patient section */}
      {section === "patient" && !openPatientDetails && (
        <>
          <h3>All Patients</h3>
          <button onClick={handleAddPatient}>Add New Patient</button>
          {addingPatient && (
            <div style={{ margin: "20px 0", padding: 16, border: "1px solid #1976d2", borderRadius: 6, background: "#f6fbff" }}>
              <h4>Add Patient</h4>
              <input name="id" value={patientForm.id} onChange={handlePatientFormChange} placeholder="ID" style={{ width: 70, marginRight: 6 }} />
              <input name="name" value={patientForm.name} onChange={handlePatientFormChange} placeholder="Name" style={{ width: 140, marginRight: 6 }} />
              <input name="age" value={patientForm.age} onChange={handlePatientFormChange} placeholder="Age" style={{ width: 60, marginRight: 6 }} />
              <input name="gender" value={patientForm.gender} onChange={handlePatientFormChange} placeholder="Gender" style={{ width: 80, marginRight: 6 }} />
              <input name="contact" value={patientForm.contact} onChange={handlePatientFormChange} placeholder="Contact" style={{ width: 110, marginRight: 6 }} />
              <input name="address" value={patientForm.address} onChange={handlePatientFormChange} placeholder="Address" style={{ width: 120, marginRight: 6 }} />
              <input name="primaryDoctorId" value={patientForm.primaryDoctorId} onChange={handlePatientFormChange} placeholder="Doctor ID" style={{ width: 80, marginRight: 6 }} />
              <input name="bloodGroup" value={patientForm.bloodGroup} onChange={handlePatientFormChange} placeholder="Blood Group" style={{ width: 90, marginRight: 6 }} />
              <input name="emergencyContact" value={patientForm.emergencyContact} onChange={handlePatientFormChange} placeholder="Emergency Contact" style={{ width: 130, marginRight: 6 }} />
              <input name="insuranceDetails" value={patientForm.insuranceDetails} onChange={handlePatientFormChange} placeholder="Insurance Details" style={{ width: 130, marginRight: 6 }} />
              <input name="password" value={patientForm.password} onChange={handlePatientFormChange} placeholder="Password" type="password" style={{ width: 115, marginRight: 6 }} />
              <br />
              <input name="medicalHistory" value={patientForm.medicalHistory} onChange={handlePatientFormChange} placeholder="Medical History (comma separated)" style={{width: "48%", marginTop: 4, marginRight: 8}} />
              <input name="currentMedications" value={patientForm.currentMedications} onChange={handlePatientFormChange} placeholder="Medications (comma separated)" style={{width: "48%", marginTop: 4}} />
              <br />
              <input name="appointments" value={patientForm.appointments} onChange={handlePatientFormChange} placeholder="Appointments (date|doctorId|reason; ...)" style={{width:"98%", marginTop: 4}} />
              <br />
              <button onClick={handlePatientAddSave} style={{ marginTop: 6 }}>Save</button>
              <button onClick={() => setAddingPatient(false)} style={{ marginLeft: 6, marginTop: 6 }}>Cancel</button>
            </div>
          )}
          {editingPatient && renderPatientEditForm()}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Phone</th>
                <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(pat =>
                <tr key={pat.id}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.id}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.name}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pat.contact}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    <button onClick={() => setOpenPatientDetails({ patient: pat, backTo: "patients" })}>Details</button>
                    <button onClick={() => handleEditPatient(pat)} style={{ marginLeft: 6 }}>Edit</button>
                  </td>
                </tr>
              )}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#888", padding: 16 }}>
                    No patient found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button style={{ marginTop: 25 }} onClick={() => setSection("doctor")}>Back</button>
        </>
      )}

      {/* Only ONE patient details page is rendered at a time */}
      {openPatientDetails && renderPatientDetailsPage(
        openPatientDetails.patient,
        () => setOpenPatientDetails(null)
      )}
    </div>
  );
}