import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useBranding } from "../context/useBranding";
import { authApi } from "../services/domain";
import Message from "../components/Message";

const LoginPage = () => {
  const { login } = useAuth();
  const { branding, setBranding } = useBranding();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login(form);
      if (data.admin?.businessName) {
        setBranding({
          businessName: data.admin.businessName,
          businessDescription: data.admin.businessDescription
        });
      }
      login(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-hero">
        <h1>{branding.businessName}</h1>
        <p>{branding.businessDescription}</p>
      </section>

      <form className="login-panel" onSubmit={submit}>
        <h2>Admin Login</h2>
        <Message error={error} />
        <label>
          Username
          <input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            autoComplete="current-password"
            required
          />
        </label>
        <button disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      </form>
    </main>
  );
};

export default LoginPage;
