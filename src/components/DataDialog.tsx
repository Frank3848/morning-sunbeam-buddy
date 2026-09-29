import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wifi } from "lucide-react";
import { toast } from "sonner";

interface DataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const networks = [
  { name: "MTN", logo: "📱" },
  { name: "Airtel", logo: "📱" },
  { name: "Glo", logo: "📱" },
  { name: "9mobile", logo: "📱" }
];

const dataPlans = [
  { size: "500MB", price: "500", validity: "30 days" },
  { size: "1GB", price: "1000", validity: "30 days" },
  { size: "2GB", price: "2000", validity: "30 days" },
  { size: "5GB", price: "2500", validity: "30 days" },
  { size: "10GB", price: "5000", validity: "30 days" },
  { size: "20GB", price: "8000", validity: "30 days" }
];

export function DataDialog({ open, onOpenChange }: DataDialogProps) {
  const [formData, setFormData] = useState({
    network: "",
    dataPlan: "",
    phoneNumber: "",
    accessCode: ""
  });

  const selectedPlan = dataPlans.find(plan => plan.size === formData.dataPlan);

  const handlePurchase = () => {
    if (!formData.network || !formData.dataPlan || !formData.phoneNumber || !formData.accessCode) {
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

    toast.success(`Data purchase of ${formData.dataPlan} to ${formData.phoneNumber} successful!`);
    setFormData({ network: "", dataPlan: "", phoneNumber: "", accessCode: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[360px] rounded-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            Buy Data
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
            <Label className="text-sm font-medium">Data Plan</Label>
            <div className="grid grid-cols-2 gap-2">
              {dataPlans.map((plan) => (
                <Button
                  key={plan.size}
                  type="button"
                  variant={formData.dataPlan === plan.size ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, dataPlan: plan.size })}
                  className="rounded-xl h-auto py-3 flex flex-col items-start"
                >
                  <span className="font-bold">{plan.size}</span>
                  <span className="text-xs opacity-80">₦{plan.price}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedPlan && (
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Plan</p>
                  <p className="font-bold text-lg">{selectedPlan.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-bold text-lg text-primary">₦{selectedPlan.price}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Valid for {selectedPlan.validity}</p>
            </div>
          )}

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
            Purchase Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
