import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { toast } from "sonner";

interface AirtimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const networks = [
  { name: "MTN", logo: "📱" },
  { name: "Airtel", logo: "📱" },
  { name: "Glo", logo: "📱" },
  { name: "9mobile", logo: "📱" }
];

const amounts = ["100", "200", "500", "1000", "2000", "5000"];

export function AirtimeDialog({ open, onOpenChange }: AirtimeDialogProps) {
  const [formData, setFormData] = useState({
    network: "",
    amount: "",
    phoneNumber: "",
    accessCode: ""
  });

  const handlePurchase = () => {
    if (!formData.network || !formData.amount || !formData.phoneNumber || !formData.accessCode) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.phoneNumber.length !== 11) {
      toast.error("Phone number must be 11 digits");
      return;
    }

    // Validate access code
    if (formData.accessCode !== "PG384839") {
      toast.error("Incorrect access code. Purchase the code and get access to the full service");
      return;
    }

    toast.success(`Airtime purchase of ₦${formData.amount} to ${formData.phoneNumber} successful!`);
    setFormData({ network: "", amount: "", phoneNumber: "", accessCode: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[360px] rounded-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            Buy Airtime
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="network" className="text-sm font-medium">Select Network</Label>
            <Select
              value={formData.network}
              onValueChange={(value) => setFormData({ ...formData, network: value })}
            >
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue placeholder="Choose network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.name} value={network.name}>
                    <span className="flex items-center gap-2">
                      <span>{network.logo}</span>
                      {network.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {amounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, amount })}
                  className="rounded-xl"
                >
                  ₦{amount}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Or enter custom amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="rounded-xl border-2 mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08012345678"
              maxLength={11}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="rounded-xl border-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessCode" className="text-sm font-medium">Access Code</Label>
            <Input
              id="accessCode"
              type="text"
              placeholder="Enter your access code"
              value={formData.accessCode}
              onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
              className="rounded-xl border-2 font-mono"
            />
          </div>

          <Button
            onClick={handlePurchase}
            className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
          >
            Purchase Airtime
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
