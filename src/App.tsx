import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Transactions from "./pages/Transactions";
import Group from "./pages/Group";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import WeeklyRewards from "./pages/WeeklyRewards";
import NotFound from "./pages/NotFound";
import ChatAssistant from "./components/ChatAssistant";
import { installAuthBridge } from "./lib/authBridge";

installAuthBridge();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/index.html" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/group" element={<Group />} />
          <Route path="/support" element={<Support />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/weekly-rewards" element={<WeeklyRewards />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
