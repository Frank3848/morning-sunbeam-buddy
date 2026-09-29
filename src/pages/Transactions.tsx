import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: string;
}

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session?.user) { navigate("/login"); return; }
      if (!mounted) return;
      setUser({ id: sess.session.user.id, email: sess.session.user.email });

      const { data, error } = await supabase
        .from("transactions" as any)
        .select("id,type,amount,description,created_at,status")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (!error && data) {
        setTransactions((data as any[]).map((t) => ({
          id: t.id, type: t.type, amount: Number(t.amount),
          description: t.description, date: t.created_at, status: t.status,
        })));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) return <div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 sm:px-4 py-3 sm:py-4 safe-top">
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            size="sm"
            className="h-9 px-2 sm:px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-sm">Back</span>
          </Button>
          <h1 className="text-lg sm:text-xl font-bold">Transaction History</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-bottom">
        {transactions.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your transaction history will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === "credit"
                          ? "bg-emerald-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-bold text-sm sm:text-base ${
                        transaction.type === "credit"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}₦
                      {transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
