import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import cashpayLogo from "@/assets/cashpay-logo.jpg";
import { useAuthReady } from "@/hooks/useAuthReady";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isReady, user } = useAuthReady();

  useEffect(() => {
    // Normalize accidental /index-style paths that can happen on reopen/refresh
    if (location.pathname === "/index" || location.pathname === "/index.html") {
      navigate("/", { replace: true });
      return;
    }

    if (!isReady) return;
    navigate(user ? "/dashboard" : "/register", { replace: true });
  }, [isReady, location.pathname, navigate, user]);

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-pulse mx-auto">
          <img 
            src={cashpayLogo} 
            alt="CashPay Logo" 
            className="h-16 object-contain mx-auto"
          />
        </div>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default NotFound;
