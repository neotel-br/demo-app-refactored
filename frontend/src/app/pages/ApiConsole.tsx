import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Code2, 
  Play, 
  Copy, 
  Check,
  Server,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const sampleRequest = {
  endpoint: "/api/v1/tokenize",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY_HERE",
    "X-VTS-Version": "7.3.0"
  },
  body: {
    data: "4532-1234-5678-9010",
    dataType: "credit_card",
    policy: "default-tokenization",
    preserveFormat: true
  }
};

const sampleResponse = {
  status: "success",
  timestamp: "2026-03-27T14:23:45.123Z",
  request_id: "req_a1b2c3d4e5f6",
  data: {
    original_length: 19,
    token: "XMPR-8574-KQWN-3621",
    masked: "****-****-****-3621",
    token_id: "tok_9876543210abc",
    policy_applied: "default-tokenization",
    format_preserved: true,
    expires_at: null
  },
  metadata: {
    processing_time_ms: 34,
    encryption_algorithm: "AES-256-GCM",
    token_version: "v2"
  }
};

export function ApiConsole() {
  const [activeTab, setActiveTab] = useState("request");
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExecuting(false);
    setShowResponse(true);
    setActiveTab("response");
    toast.success("Request executed successfully", {
      description: "Token generated in 34ms",
    });
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Console</h1>
          <p className="text-slate-400">
            Test and explore Vormetric Tokenization Server APIs
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
        >
          <Server className="w-3 h-3 mr-1" />
          VTS v7.3.0
        </Badge>
      </div>

      {/* API Endpoint Card */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              POST
            </Badge>
            <code className="text-blue-400 font-mono text-sm">
              https://vts.thales.com/api/v1/tokenize
            </code>
          </div>
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isExecuting ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Request
              </>
            )}
          </Button>
        </div>
        <p className="text-slate-400 text-sm">
          Tokenize sensitive data with format-preserving encryption
        </p>
      </Card>

      {/* Request/Response Tabs */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-slate-800 px-6">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="request"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              >
                <Code2 className="w-4 h-4 mr-2" />
                Request
              </TabsTrigger>
              <TabsTrigger
                value="response"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
                disabled={!showResponse}
              >
                <Server className="w-4 h-4 mr-2" />
                Response
                {showResponse && (
                  <Badge className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    200
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="request" className="p-6 space-y-4 mt-0">
            {/* Headers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Headers</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(JSON.stringify(sampleRequest.headers, null, 2), "headers")
                  }
                  className="h-7 text-slate-400 hover:text-white"
                >
                  {copiedSection === "headers" ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                {JSON.stringify(sampleRequest.headers, null, 2)}
              </pre>
            </div>

            {/* Request Body */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Request Body</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(JSON.stringify(sampleRequest.body, null, 2), "body")
                  }
                  className="h-7 text-slate-400 hover:text-white"
                >
                  {copiedSection === "body" ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                {JSON.stringify(sampleRequest.body, null, 2)}
              </pre>
            </div>

            {/* cURL Command */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">cURL Command</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const curlCommand = `curl -X POST https://vts.thales.com/api/v1/tokenize \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "X-VTS-Version: 7.3.0" \\
  -d '${JSON.stringify(sampleRequest.body)}'`;
                    handleCopy(curlCommand, "curl");
                  }}
                  className="h-7 text-slate-400 hover:text-white"
                >
                  {copiedSection === "curl" ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                {`curl -X POST https://vts.thales.com/api/v1/tokenize \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -H "X-VTS-Version: 7.3.0" \\
  -d '${JSON.stringify(sampleRequest.body)}'`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="response" className="p-6 space-y-4 mt-0">
            {showResponse && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      200 OK
                    </Badge>
                    <span className="text-sm text-slate-400">
                      Response Time: 34ms
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleCopy(JSON.stringify(sampleResponse, null, 2), "response")
                    }
                    className="h-7 text-slate-400 hover:text-white"
                  >
                    {copiedSection === "response" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>

                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                  {JSON.stringify(sampleResponse, null, 2)}
                </pre>

                {/* Response Details */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Card className="bg-slate-950 border-slate-800 p-4">
                    <p className="text-xs text-slate-400 mb-1">Processing Time</p>
                    <p className="text-lg font-semibold text-white">34ms</p>
                  </Card>
                  <Card className="bg-slate-950 border-slate-800 p-4">
                    <p className="text-xs text-slate-400 mb-1">Encryption</p>
                    <p className="text-lg font-semibold text-white">AES-256</p>
                  </Card>
                  <Card className="bg-slate-950 border-slate-800 p-4">
                    <p className="text-xs text-slate-400 mb-1">Format Preserved</p>
                    <p className="text-lg font-semibold text-emerald-400">Yes</p>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Available Endpoints */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Available Endpoints</h2>
        <div className="space-y-3">
          {[
            {
              method: "POST",
              path: "/api/v1/tokenize",
              description: "Tokenize sensitive data",
            },
            {
              method: "POST",
              path: "/api/v1/detokenize",
              description: "Retrieve original data from token",
            },
            {
              method: "POST",
              path: "/api/v1/mask",
              description: "Generate masked representation",
            },
            {
              method: "GET",
              path: "/api/v1/policies",
              description: "List tokenization policies",
            },
            {
              method: "GET",
              path: "/api/v1/tokens/:id",
              description: "Get token metadata",
            },
          ].map((endpoint) => (
            <div
              key={endpoint.path}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
            >
              <div className="flex items-center gap-4">
                <Badge
                  className={
                    endpoint.method === "POST"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }
                >
                  {endpoint.method}
                </Badge>
                <div>
                  <code className="text-blue-400 font-mono text-sm">
                    {endpoint.path}
                  </code>
                  <p className="text-xs text-slate-400 mt-1">
                    {endpoint.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Try
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* SDK Examples */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">SDK Examples</h2>
        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="java">Java</TabsTrigger>
          </TabsList>
          <TabsContent value="javascript" className="mt-4">
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
              {`import { VormetricClient } from '@thales/vts-sdk';

const client = new VormetricClient({
  apiKey: 'YOUR_API_KEY_HERE',
  endpoint: 'https://vts.thales.com'
});

// Tokenize data
const result = await client.tokenize({
  data: '4532-1234-5678-9010',
  dataType: 'credit_card',
  policy: 'default-tokenization'
});

console.log(result.token); // XMPR-8574-KQWN-3621`}
            </pre>
          </TabsContent>
          <TabsContent value="python" className="mt-4">
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
              {`from vormetric import VTSClient

client = VTSClient(
    api_key='YOUR_API_KEY_HERE',
    endpoint='https://vts.thales.com'
)

# Tokenize data
result = client.tokenize(
    data='4532-1234-5678-9010',
    data_type='credit_card',
    policy='default-tokenization'
)

print(result['token'])  # XMPR-8574-KQWN-3621`}
            </pre>
          </TabsContent>
          <TabsContent value="java" className="mt-4">
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
              {`import com.thales.vts.VTSClient;
import com.thales.vts.model.TokenizeRequest;

VTSClient client = new VTSClient.Builder()
    .apiKey("YOUR_API_KEY_HERE")
    .endpoint("https://vts.thales.com")
    .build();

// Tokenize data
TokenizeRequest request = new TokenizeRequest()
    .setData("4532-1234-5678-9010")
    .setDataType("credit_card")
    .setPolicy("default-tokenization");

TokenizeResponse response = client.tokenize(request);
System.out.println(response.getToken());`}
            </pre>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
