import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {setUser} = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset foutmelding
    try {
      // login request naar backend
      const res = await axios.post("/auth/login", { email, wachtwoord });
      setUser(res.data.user)
      const rol = res.data.user.rol;

      // rol-gebaseerde redirect
      if (rol === "admin") navigate("/dashboard/admin");
      else if (rol === "comissie") navigate("/dashboard/comissie");
      else if (rol === "docent") navigate("/dashboard/docent");
      else if (rol === "student") navigate("/dashboard/student");
      else if (rol === "mentor") navigate("/dashboard/mentor");
      else setError("Onbekende rol");
    } catch (err) {
      console.error(err);
      // foutmelding tonen bij verkeerde credentials of serverfout
      if (err.response && err.response.status === 401) {
        setError("Ongeldige e-mail of wachtwoord");
      } else {
        setError("Serverfout. Probeer later opnieuw.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">E-mailadres</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@voorbeeld.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Wachtwoord</label>
            <input
              type="password"
              className="form-control"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              placeholder="Wachtwoord"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;