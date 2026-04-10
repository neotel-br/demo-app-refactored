import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { 
  Shield, 
  Key, 
  Eye, 
  Copy, 
  Check, 
  ArrowRight, 
  Lock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Sample data templates for easy demos
const sampleData = {
  creditCard: "4532-1234-5678-9010",
  ssn: "123-45-6789",
  email: "john.smith@example.com",
  phone: "555-123-4567",
  bankAccount: "987654321",
};

export function Tokenize() {
  const [inputData, setInputData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    original: string;
    tokenized: string;
    masked: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSampleDataSelect = (value: string) => {
    if (value === "clear") {
      setInputData("");
      setResult(null);
      return;
    }
    setInputData(sampleData[value as keyof typeof sampleData]);
  };

  const handleTokenize = async () => {
    if (!inputData.trim()) {
      toast.error("Please enter data to tokenize");
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock tokenization logic
    const generateToken = (data: string) => {
      const length = data.length;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return Array.from({ length }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    const generateMask = (data: string) => {
      const visibleChars = Math.min(4, Math.floor(data.length * 0.3));
      const masked = "*".repeat(data.length - visibleChars);
      return masked + data.slice(-visibleChars);
    };

    setResult({
      original: inputData,
      tokenized: generateToken(inputData),
      masked: generateMask(inputData),
    });

    setIsProcessing(false);
    toast.success("Data tokenized successfully", {
      description: "Sensitive data has been securely tokenized and masked",
    });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReset = () => {
    setInputData("");
    setResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tokenize Data</h1>
          <p className="text-slate-400">
            Transform sensitive data into secure tokens with format-preserving encryption
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        >
          <Lock className="w-3 h-3 mr-1" />
          Encrypted Connection
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Input Data</h2>
          </div>

          <div className="space-y-4">
            {/* Sample Data Selector */}
            <div>
              <Label htmlFor="sample-data" className="text-slate-300">
                Quick Start (Sample Data)
              </Label>
              <Select onValueChange={handleSampleDataSelect}>
                <SelectTrigger className="mt-2 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Choose sample data..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="creditCard" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Credit Card
                  </SelectItem>
                  <SelectItem value="ssn" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Social Security Number
                  </SelectItem>
                  <SelectItem value="email" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Email Address
                  </SelectItem>
                  <SelectItem value="phone" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Phone Number
                  </SelectItem>
                  <SelectItem value="bankAccount" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Bank Account
                  </SelectItem>
                  <SelectItem value="clear" className="text-slate-300 focus:bg-slate-800 focus:text-white">
                    Clear Input
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sensitive-data" className="text-slate-300">
                Sensitive Data
              </Label>
              <Textarea
                id="sensitive-data"
                placeholder="Enter credit card, SSN, email, or any sensitive data..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[200px] font-mono"
              />
              <p className="text-xs text-slate-500 mt-2">
                Data is processed securely and never stored in plaintext
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTokenize}
                disabled={isProcessing || !inputData.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Tokenize Data
                  </>
                )}
              </Button>
              {result && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Section */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Results</h2>
          </div>

          {!result ? (
            <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-slate-800 rounded-lg">
              <div className="text-center">
                <Key className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">Results will appear here</p>
                <p className="text-xs text-slate-600 mt-1">
                  Enter data and click "Tokenize Data"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Original Data */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-400 text-xs uppercase tracking-wider">
                    Original Data (Secured)
                  </Label>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    <Eye className="w-3 h-3 mr-1" />
                    Protected
                  </Badge>
                </div>
                <div className="relative">
                  <p className="text-white font-mono text-sm bg-slate-900 p-3 rounded border border-slate-700 blur-sm hover:blur-none transition-all">
                    {result.original}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Hover to reveal (in production, this would require authentication)
                  </p>
                </div>
              </div>

              {/* Tokenized Value */}
              <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-blue-400 text-xs uppercase tracking-wider">
                    Tokenized Value
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.tokenized, "Token")}
                    className="h-7 text-slate-400 hover:text-white"
                  >
                    {copiedField === "Token" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-blue-300 font-mono text-sm bg-slate-900 p-3 rounded border border-blue-500/30">
                  {result.tokenized}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Secure, reversible token for storage and processing
                </p>
              </div>

              {/* Masked Value */}
              <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-purple-400 text-xs uppercase tracking-wider">
                    Masked Value
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.masked, "Masked")}
                    className="h-7 text-slate-400 hover:text-white"
                  >
                    {copiedField === "Masked" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-purple-300 font-mono text-sm bg-slate-900 p-3 rounded border border-purple-500/30">
                  {result.masked}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Display-friendly format for user interfaces
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Transformation Flow Visualization */}
      {result && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Transformation Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Original Data</h3>
              <p className="text-sm text-slate-400">
                Sensitive information entered by user
              </p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-blue-500" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500/30">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Tokenization</h3>
              <p className="text-sm text-slate-400">
                VTS generates secure, reversible token
              </p>
            </div>

            <div className="flex items-center justify-center md:col-start-2">
              <ArrowRight className="w-8 h-8 text-purple-500" />
            </div>

            <div className="flex flex-col items-center text-center md:col-start-3">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-purple-500/30">
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Masking</h3>
              <p className="text-sm text-slate-400">
                Partially obscured for safe display
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Security Info */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">
              Enterprise-Grade Security
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              All tokenization operations use AES-256 encryption with format-preserving
              algorithms. Tokens are cryptographically secure and reversible only with
              proper authorization. Your data never leaves the secure processing environment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}