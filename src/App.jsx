// --- IMPORTS ---
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// --- APP START ---
export default function App() {

  // 🔐 AUTH STATE
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🧠 APP DATA
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 🎯 DEMO MODE
  const [isDemo, setIsDemo] = useState(true);

  // ===============================
  // 🔐 AUTH FUNCTIONS
  // ===============================

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Check your email to confirm!");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDemo(true);
  };

  // ===============================
  // 🔄 SESSION CHECK
  // ===============================

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) setIsDemo(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsDemo(!session?.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ===============================
  // ☁️ LOAD STUDENTS
  // ===============================

  useEffect(() => {
    if (!user) return;

    const loadStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id);

      if (data) setStudents(data);
    };

    loadStudents();
  }, [user]);

  // ===============================
  // ➕ ADD STUDENT
  // ===============================

  const addStudent = async (name) => {
    if (isDemo) {
      setStudents([...students, { id: Date.now(), name }]);
      return;
    }

    const { data } = await supabase
      .from("students")
      .insert([{ name, user_id: user.id }])
      .select();

    if (data) setStudents([...students, data[0]]);
  };

  // ===============================
  // 🧾 LOGIN SCREEN
  // ===============================

  if (!user && !isDemo) {
    return (
      <div style={{ padding: 40 }}>
        <h2>RaMP Tracker Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={signIn}>Login</button>
        <button onClick={signUp}>Sign Up</button>
        <br /><br />

        <button onClick={() => setIsDemo(true)}>Try Demo</button>
      </div>
    );
  }

  // ===============================
  // 🧠 MAIN APP
  // ===============================

  return (
    <div style={{ padding: 20 }}>
      <h1>RaMP Tracker</h1>

      {!isDemo && (
        <button onClick={signOut}>Logout</button>
      )}

      {isDemo && <p>Demo Mode</p>}

      <hr />

      <h2>Add Student</h2>
      <button onClick={() => {
        const name = prompt("Student Name");
        if (name) addStudent(name);
      }}>
        Add Student
      </button>

      <h2>Students</h2>
      {students.map((s) => (
        <div
          key={s.id}
          onClick={() => setSelectedStudent(s)}
          style={{
            padding: 10,
            border: "1px solid #ccc",
            margin: 5,
            cursor: "pointer"
          }}
        >
          {s.name}
        </div>
      ))}

      {selectedStudent && (
        <div>
          <h2>{selectedStudent.name}</h2>
          <p>Student dashboard coming next...</p>
        </div>
      )}
    </div>
  );
}
