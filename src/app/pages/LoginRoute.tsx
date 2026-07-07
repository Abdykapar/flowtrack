import { useNavigate } from "react-router";
import { LoginPage } from "../components/LoginPage";
import { useAppData } from "../context/AppDataContext";
import type { User } from "@/lib/api";

export default function LoginRoute() {
  const { login } = useAppData();
  const navigate = useNavigate();

  const handleLogin = (user: User) => {
    login(user);
    navigate("/dashboard", { replace: true });
  };

  return <LoginPage onLogin={handleLogin} />;
}
